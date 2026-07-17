#!/usr/bin/env python3
"""
MQTT Simulator – Einfahrt / Ausfahrt
Verwendung:
  python mqtt_sim.py einfahren ABC123
  python mqtt_sim.py ausfahren ABC123
  python mqtt_sim.py          (interaktiver Modus)
"""

import json
import sys

BROKER = "192.168.8.110"
PORT   = 1883

BEISPIEL_KENNZEICHEN = [
    "MUC1234", "B-AB123", "A-BC456", "FFB-XY99",
    "RE-BO77", "DO-AB12", "NUE-ZZ1", "ROT-QW3",
]


def send(action: str, plate: str) -> None:
    try:
        import paho.mqtt.publish as publish
    except ImportError:
        print("paho-mqtt nicht installiert → pip install paho-mqtt")
        sys.exit(1)

    plate = plate.upper().strip()
    topic = f"{action}/plate"
    payload = json.dumps({"plate": plate})

    publish.single(topic, payload=payload, hostname=BROKER, port=PORT)
    print(f"  ✓ [{action.upper():>10}]  topic='{topic}'  payload={payload}")


def interactive() -> None:
    print(f"\nMQTT Simulator  →  {BROKER}:{PORT}")
    print("=" * 45)

    while True:
        print("\nAktionen:")
        print("  e  – Einfahrt senden")
        print("  a  – Ausfahrt senden")
        print("  b  – Beispielkennzeichen auflisten")
        print("  q  – Beenden")

        choice = input("\nAuswahl: ").strip().lower()

        if choice == "q":
            break
        elif choice == "b":
            print("\nBeispiele:", ", ".join(BEISPIEL_KENNZEICHEN))
        elif choice in ("e", "a"):
            action = "einfahren" if choice == "e" else "ausfahren"
            plate = input(f"Kennzeichen für {action}: ").strip()
            if not plate:
                print("  Kein Kennzeichen eingegeben.")
                continue
            send(action, plate)
        else:
            print("  Ungültige Eingabe.")


if __name__ == "__main__":
    if len(sys.argv) == 3:
        action_arg = sys.argv[1].lower()
        if action_arg not in ("einfahren", "ausfahren"):
            print("Fehler: Aktion muss 'einfahren' oder 'ausfahren' sein.")
            sys.exit(1)
        send(action_arg, sys.argv[2])
    elif len(sys.argv) == 1:
        interactive()
    else:
        print(__doc__)
        sys.exit(1)
