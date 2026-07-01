import cv2
import time
import json
import re
import warnings
import argparse
import paho.mqtt.client as mqtt
from ultralytics import YOLO
import easyocr
from flask import Flask, Response
import threading
from collections import Counter

# --- Configuration & Arguments ---
parser = argparse.ArgumentParser(description='LPR Engine Camera Instance')
parser.add_argument('--id', type=str, default='einfahren', help='Camera ID (einfahren/ausfahren)')
parser.add_argument('--src', default=0, help='Camera Source (Index or URL)')
parser.add_argument('--port', type=int, default=5000, help='Flask Stream Port')
args = parser.parse_args()

CAMERA_ID = args.id
MQTT_BROKER = "192.168.12.1"
MQTT_TOPIC = f"{CAMERA_ID}/plate"
YOLO_MODEL_PATH = "/home/iot/Nummernschilderkennung/yolov8n_ncnn_model"
DETECTION_THRESHOLD = 0.5
DEBOUNCE_SECONDS = 5
STREAM_PORT = args.port
DEBUG_VISUALS = False

# Try to convert src to int if it's a digit
try:
    CAMERA_SRC = int(args.src)
except ValueError:
    CAMERA_SRC = args.src

# Warnungen unterdrücken
warnings.filterwarnings("ignore", category=UserWarning)

# German License Plate Regex
GERMAN_PLATE_PATTERN = re.compile(r"^[A-ZÄÖÜ]{1,3}[A-Z]{1,2}[0-9]{1,4}[EH]?$")

# Performance settings
PROCESS_EVERY_N_FRAMES = 5  
PROCESSING_WIDTH = 720      
STREAM_WIDTH = 400          
STABILIZATION_WINDOW = 20.0  
STABILIZATION_MIN_SAMPLES = 2 
MIN_PLATE_LENGTH = 3        

# --- Global State ---
raw_frame = None       
output_frame = None    
current_detections = [] 
detection_buffer = []
last_publish_time = 0
lock = threading.Lock()
app = Flask(__name__)

# --- Video Capture Thread ---
import numpy as np
try:
    from picamera2 import Picamera2
    HAS_PICAMERA = True
except ImportError:
    HAS_PICAMERA = False

class VideoCaptureThread(threading.Thread):
    def __init__(self, src=0):
        super().__init__()
        self.stopped = False
        self.daemon = True
        self.picam = None
        self.cap = None

        if HAS_PICAMERA:
            print("[KAMERA] Raspberry Pi 5 Hardware erkannt. Initialisiere Picamera2...")
            # Wir testen beide Kamera-Indizes (0 und 1) durch, falls einer fehlschlägt
            for cam_idx in [0, 1]:
                try:
                    print(f"[KAMERA] Versuche Picamera2 auf Port: {cam_idx}")
                    self.picam = Picamera2(cam_idx) # <-- Hier geben wir die Port-ID mit!
                    
                    config = self.picam.create_preview_configuration(main={"size": (1280, 720), "format": "RGB888"})
                    self.picam.configure(config)
                    self.picam.start()
                    print(f"[KAMERA] Nativer Pi 5 Kamera-Stream auf Port {cam_idx} erfolgreich gestartet!")
                    break
                except Exception as e:
                    print(f"[WARNUNG] Port {cam_idx} fehlgeschlagen: {e}")
                    self.picam = None

        if self.picam is None:
            print(f"[KAMERA] Nutze Standard OpenCV-V4L2 Fallback für Quelle {src}...")
            self.cap = cv2.VideoCapture(src)

    def run(self):
        global raw_frame, lock
        first_frame = True
        
        while not self.stopped:
            frame = None
            
            if self.picam is not None:
                img = self.picam.capture_array()
                # --- ULTIMATIVER FARB-FIX FÜR PI 5 ---
                # img[..., ::-1] dreht die Farbkanäle auf Array-Ebene um (RGB <-> BGR).
                # Das löst das Rot/Blau Vertauschungsproblem hochperformant ohne cv2.cvtColor Abstürze.
                frame = img.copy()
            elif self.cap is not None and self.cap.isOpened():
                success, img = self.cap.read()
                if success:
                    frame = img

            if frame is not None:
                if first_frame:
                    print("[KAMERA] ERSTES BILD ERFOLGREICH EMPFANGEN!")
                    first_frame = False
                with lock:
                    raw_frame = frame
            else:
                time.sleep(0.01)

    def stop(self):
        self.stopped = True
        if self.picam is not None:
            self.picam.stop()
        if self.cap is not None:
            self.cap.release()

# --- AI Processing Thread ---
class ProcessingThread(threading.Thread):
    def __init__(self, yolo_model, ocr_reader, mqtt_client):
        super().__init__()
        self.model = yolo_model
        self.reader = ocr_reader
        self.client = mqtt_client
        self.daemon = True

    def run(self):
        global raw_frame, current_detections, detection_buffer, last_publish_time, lock
        frame_counter = 0
        print("[KI-THREAD] Verarbeitungs-Thread erfolgreich gestartet und aktiv!")
        while True:
            frame_counter += 1
            if frame_counter % PROCESS_EVERY_N_FRAMES != 0:
                time.sleep(0.01) # Leicht erhöht für CPU-Entlastung bei 1GB RAM
                continue
                
            process_frame = None
            with lock:
                if raw_frame is not None:
                    process_frame = raw_frame.copy()
            
            if process_frame is None:
                time.sleep(0.1)
                continue

            current_time = time.time()
            small_frame = cv2.resize(process_frame, (PROCESSING_WIDTH, int(process_frame.shape[0] * (PROCESSING_WIDTH / process_frame.shape[1]))))
            scale_x = process_frame.shape[1] / small_frame.shape[1]
            scale_y = process_frame.shape[0] / small_frame.shape[0]
            
            # Task explizit übergeben, um YOLO-Warnung zu stoppen
            results = self.model(small_frame, verbose=False, task='detect', device='cpu')
            new_detections = []
            
            for result in results:
                if len(result.boxes) > 0:
                    print(f"[YOLO] {len(result.boxes)} potenzielle(s) Nummernschild(er) im Frame entdeckt!")
                    
                for box in result.boxes:
                    if box.conf[0] > DETECTION_THRESHOLD:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        roi = small_frame[y1:y2, x1:x2]
                        if roi.size == 0: continue

                        # --- PERFORMANCE BOOST 1: ROI verkleinern / Graustufen ---
                        # EasyOCR arbeitet intern mit Graustufen. Wenn wir es vorschalten, spart das RAM.
                        roi_gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
                        
                        # Feste Höhe erzwingen (z.B. 64 Pixel hoch), um EasyOCR-Rechenlast zu standardisieren
                        h_roi, w_roi = roi_gray.shape
                        scale_roi = 120.0 / h_roi
                        roi_resized = cv2.resize(roi_gray, (int(w_roi * scale_roi), 120), interpolation=cv2.INTER_CUBIC)    
                        _, roi_final = cv2.threshold(roi_resized, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                        print("[OCR] Starte Texterkennung auf Nummernschild-Ausschnitt...")
                        ocr_start = time.time()
                        ocr_results = self.reader.readtext(roi_final, paragraph=False, decoder='greedy', allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ0123456789- ')
                        ocr_results.sort(key=lambda x: x[0][0][0])
                        raw_text = "".join([res[1] for res in ocr_results])
                        plate_text = re.sub(r'[^A-Z0-9ÄÖÜ]', '', raw_text.upper())
                        if len(plate_text) < MIN_PLATE_LENGTH: continue
                        print(f"[OCR] Fertig in {time.time() - ocr_start:.2f}s. Erkannt: '{plate_text}'")
                        
                        # Stempel-Korrektur
                        if not bool(GERMAN_PLATE_PATTERN.match(plate_text)):
                            alt_text = re.sub(r'(?<=[A-Z])S(?=[A-Z0-9])', '', plate_text)
                            if bool(GERMAN_PLATE_PATTERN.match(alt_text)):
                                plate_text = alt_text

                        is_valid = bool(GERMAN_PLATE_PATTERN.match(plate_text))
                        print(f"[VALIDIERUNG] Ist deutsches Kennzeichen? -> {is_valid}")
                        
                        if is_valid or DEBUG_VISUALS:
                            new_detections.append({
                                'box': [int(x1 * scale_x), int(y1 * scale_y), int(x2 * scale_x), int(y2 * scale_y)],
                                'text': plate_text,
                                'valid': is_valid
                            })

                        if is_valid:
                            with lock:
                                detection_buffer.append({'plate': plate_text, 'ts': current_time})

            with lock:
                current_detections = new_detections
                detection_buffer = [d for d in detection_buffer if (current_time - d['ts']) < STABILIZATION_WINDOW]
                if len(detection_buffer) >= STABILIZATION_MIN_SAMPLES:
                    counts = Counter([d['plate'] for d in detection_buffer])
                    candidates = [plate for plate, count in counts.items() if count >= STABILIZATION_MIN_SAMPLES]
                    if candidates:
                        most_common_plate = max(candidates, key=len)
                        if (current_time - last_publish_time) > DEBOUNCE_SECONDS:
                            payload = {"plate": most_common_plate}
                            self.client.publish(MQTT_TOPIC, json.dumps(payload))
                            print(f"\n🚀 --- MQTT PUBLISHED ({CAMERA_ID}): {most_common_plate} ---\n")
                            last_publish_time = current_time
                            detection_buffer = []

# --- Flask Stream ---
@app.route('/video_feed')
def video_feed():
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

def generate():
    global output_frame, lock
    while True:
        with lock:
            if output_frame is None:
                continue
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 40]  # Qualität leicht runter für flüssigen Stream
            (flag, encodedImage) = cv2.imencode(".jpg", output_frame, encode_param)
            if not flag:
                continue
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')

# --- Main Engine ---
def main():
    global raw_frame, output_frame, current_detections, lock

    print("[INIT] Lade YOLO-Modell...")
    yolo_model = YOLO(YOLO_MODEL_PATH)
    
    print("[INIT] Lade EasyOCR (das kann einen Moment dauern)...")
    ocr_reader = easyocr.Reader(['de'], gpu=False, quantize=True, recognizer=True)
    print("[INIT] Modelle erfolgreich geladen!")

    client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)

    try:
        client.connect(MQTT_BROKER, 1883, 60)
        client.loop_start()
    except Exception as e: print(f"MQTT Error: {e}")

    threading.Thread(target=lambda: app.run(host='0.0.0.0', port=STREAM_PORT, debug=False, use_reloader=False), daemon=True).start()
    
    vcap = VideoCaptureThread(CAMERA_SRC)
    vcap.start()
    
    proc = ProcessingThread(yolo_model, ocr_reader, client)
    proc.start()

    print(f"LPR Engine {CAMERA_ID} running. Stream: http://localhost:{STREAM_PORT}/video_feed")
    while True:
        frame = None
        detections = []

        # Lock nur ganz kurz öffnen, Daten kopieren, Lock sofort wieder schließen!
        with lock:
            if raw_frame is not None:
                frame = raw_frame.copy()
                detections = list(current_detections)

        # Wenn kein Frame da ist, warten wir AUSSERHALB des Locks
        if frame is None:
            time.sleep(0.03)  # ca. 30 FPS Abfragerate
            continue

        # Ab hier läuft die Bildverarbeitung ohne das Lock zu blockieren!
        display_frame = cv2.resize(frame, (STREAM_WIDTH, int(frame.shape[0] * (STREAM_WIDTH / frame.shape[1]))))
        scale_stream = STREAM_WIDTH / frame.shape[1]
        for det in detections:
            bx1, by1, bx2, by2 = det['box']
            color = (0, 255, 0) if det['valid'] else (0, 0, 255)
            cv2.rectangle(display_frame, (int(bx1*scale_stream), int(by1*scale_stream)), (int(bx2*scale_stream), int(by2*scale_stream)), color, 2)
            cv2.putText(display_frame, det['text'], (int(bx1*scale_stream), int(by1*scale_stream) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        # Erst zum Schreiben des fertigen Bildes sperren wir wieder kurz
        with lock:
            output_frame = display_frame

        time.sleep(0.03) # Begrenzt die Hauptschleife auf ~30 FPS 

if __name__ == "__main__":
    main()
