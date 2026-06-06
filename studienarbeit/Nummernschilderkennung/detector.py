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
parser.add_argument('--id', type=str, default='entrance', help='Camera ID (entrance/exit)')
parser.add_argument('--src', default=0, help='Camera Source (Index or URL)')
parser.add_argument('--port', type=int, default=5000, help='Flask Stream Port')
args = parser.parse_args()

CAMERA_ID = args.id
MQTT_BROKER = "localhost"
MQTT_TOPIC = f"parking/{CAMERA_ID}/detection"
YOLO_MODEL_PATH = "/home/maxim/prj/cps-sose-26-strauss/studienarbeit/Nummernschilderkennung/yolov8n.pt"
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
PROCESS_EVERY_N_FRAMES = 2  
PROCESSING_WIDTH = 800      
STREAM_WIDTH = 640          
STABILIZATION_WINDOW = 1.5  
STABILIZATION_MIN_SAMPLES = 2 
MIN_PLATE_LENGTH = 5        

# --- Global State ---
raw_frame = None       
output_frame = None    
current_detections = [] 
detection_buffer = []
last_publish_time = 0
lock = threading.Lock()
app = Flask(__name__)

# --- Video Capture Thread ---
class VideoCaptureThread(threading.Thread):
    def __init__(self, src=0):
        super().__init__()
        self.cap = cv2.VideoCapture(src)
        self.stopped = False
        self.daemon = True

    def run(self):
        global raw_frame, lock
        while not self.stopped:
            success, frame = self.cap.read()
            if success:
                with lock:
                    raw_frame = frame
            else:
                time.sleep(0.01)

# --- AI Processing Thread ---
class ProcessingThread(threading.Thread):
    def __init__(self, model_path, mqtt_client):
        super().__init__()
        self.model = YOLO(model_path)
        self.reader = easyocr.Reader(['de', 'en'], gpu=False)
        self.client = mqtt_client
        self.daemon = True

    def run(self):
        global raw_frame, current_detections, detection_buffer, last_publish_time, lock
        while True:
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
            
            results = self.model(small_frame, verbose=False)
            new_detections = []
            
            for result in results:
                for box in result.boxes:
                    if box.conf[0] > DETECTION_THRESHOLD:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        roi = small_frame[y1:y2, x1:x2]
                        if roi.size == 0: continue
                        
                        ocr_results = self.reader.readtext(roi, paragraph=False)
                        ocr_results.sort(key=lambda x: x[0][0][0])
                        raw_text = "".join([res[1] for res in ocr_results])
                        plate_text = re.sub(r'[^A-Z0-9ÄÖÜ]', '', raw_text.upper())
                        
                        # Stempel-Korrektur
                        if not bool(GERMAN_PLATE_PATTERN.match(plate_text)):
                            alt_text = re.sub(r'(?<=[A-Z])S(?=[A-Z0-9])', '', plate_text)
                            if bool(GERMAN_PLATE_PATTERN.match(alt_text)):
                                plate_text = alt_text

                        is_valid = bool(GERMAN_PLATE_PATTERN.match(plate_text))
                        
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
                            payload = {"camera": CAMERA_ID, "plate": most_common_plate, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
                            self.client.publish(MQTT_TOPIC, json.dumps(payload))
                            print(f"--- PUBLISHED ({CAMERA_ID}): {most_common_plate} ---")
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
            (flag, encodedImage) = cv2.imencode(".jpg", output_frame)
            if not flag:
                continue
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')

# --- Main Engine ---
def main():
    global raw_frame, output_frame, current_detections, lock

    client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
    try:
        client.connect(MQTT_BROKER, 1883, 60)
        client.loop_start()
    except Exception as e: print(f"MQTT Error: {e}")

    threading.Thread(target=lambda: app.run(host='0.0.0.0', port=STREAM_PORT, debug=False, use_reloader=False), daemon=True).start()
    
    vcap = VideoCaptureThread(CAMERA_SRC)
    vcap.start()
    
    proc = ProcessingThread(YOLO_MODEL_PATH, client)
    proc.start()

    print(f"LPR Engine {CAMERA_ID} running. Stream: http://localhost:{STREAM_PORT}/video_feed")

    while True:
        with lock:
            if raw_frame is None:
                time.sleep(0.01)
                continue
            frame = raw_frame.copy()
            detections = list(current_detections) 

        display_frame = cv2.resize(frame, (STREAM_WIDTH, int(frame.shape[0] * (STREAM_WIDTH / frame.shape[1]))))
        scale_stream = STREAM_WIDTH / frame.shape[1]
        for det in detections:
            bx1, by1, bx2, by2 = det['box']
            color = (0, 255, 0) if det['valid'] else (0, 0, 255)
            cv2.rectangle(display_frame, (int(bx1*scale_stream), int(by1*scale_stream)), (int(bx2*scale_stream), int(by2*scale_stream)), color, 2)
            cv2.putText(display_frame, det['text'], (int(bx1*scale_stream), int(by1*scale_stream) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        with lock:
            output_frame = display_frame

        time.sleep(0.016) 

if __name__ == "__main__":
    main()
