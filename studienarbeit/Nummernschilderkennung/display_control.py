#!/usr/bin/env python3
import sys
import serial
import time

# --- Konfiguration ---
SERIAL_PORT = '/dev/ttyUSB0' 
BAUD_RATE = 9600
DISPLAY_DELAY = 5  # Wie viele Sekunden soll das Kennzeichen lesbar sein?

def main():
    if len(sys.argv) < 2:
        print("Fehler: Kein Text für das Display übergeben.")
        sys.exit(1)
        
    # Alle übergebenen Argumente mit Leerzeichen verbinden
    text_to_display = " ".join(sys.argv[1:])
    
    try:
        # Verbindung zum D1 Mini über USB aufbauen
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        time.sleep(2) # Dem D1 Mini Zeit zum Resetten geben
        
        # 1. Den eigentlichen Text (z.B. Willkommen...) senden
        ser.write(f"{text_to_display}\n".encode('utf-8'))
        print(f"Erfolgreich an D1 Mini gesendet: {text_to_display}")
        
        # 2. Hier ist dein gewünschter Delay!
        print(f"Warte {DISPLAY_DELAY} Sekunden...")
        time.sleep(DISPLAY_DELAY)
        
        # 3. Automatisch wieder auf "BEREIT" zurücksetzen
        ser.write("BEREIT\n".encode('utf-8'))
        print("Display erfolgreich wieder auf 'BEREIT' zurückgesetzt.")
        
        ser.close()
    except Exception as e:
        print(f"Fehler bei der USB-Übertragung an den D1 Mini: {e}")

if __name__ == "__main__":
    main()