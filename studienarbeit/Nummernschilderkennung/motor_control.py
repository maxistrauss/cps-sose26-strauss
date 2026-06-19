#!/usr/bin/env python3
import os
# ZWINGT gpiozero auf dem Pi 5 zur Nutzung des neuen Treibers statt pigpio
os.environ['GPIOZERO_PIN_FACTORY'] = 'lgpio'

import warnings
# Unterdrückt die Warnungen im Node-RED Log
warnings.filterwarnings("ignore", message="To reduce servo jitter")

from gpiozero import Servo
from time import sleep

# --- Hardware-Konfiguration ---
SERVO_PIN = 18  # GPIO 18 (Physischer Pin 12 am Pi)
PARK_DELAY = 5  # Wie viele Sekunden bleibt die Schranke offen?

# Winkel-Korrektur (Werte zwischen -1.0 und 1.0)
POS_OPEN = 0.0    # Schranke offen
POS_CLOSE = -1.0  # Schranke geschlossen


def main():
    try:
        servo = Servo(SERVO_PIN, min_pulse_width=0.5/1000, max_pulse_width=2.5/1000, frame_width=20/1000)
        
        # 1. Schranke öffnen
        print("Fahre Schranke HOCH...")
        servo.value = POS_OPEN
        sleep(0.8)
        servo.detach()  # Signal abschalten (Servo entspannen)
        
        # 2. Warten
        print(f"Schranke bleibt geöffnet für {PARK_DELAY} Sekunden...")
        sleep(PARK_DELAY)
        
        # 3. Schranke schließen
        print("Fahre Schranke RUNTER...")
        servo.value = POS_CLOSE
        sleep(0.8)
        servo.detach()  # Signal abschalten (Servo entspannen)
        
        print("Ablauf erfolgreich beendet.")
        
    except Exception as e:
        print(f"Fehler bei Schrankenbewegung: {e}")

if __name__ == "__main__":
    main()