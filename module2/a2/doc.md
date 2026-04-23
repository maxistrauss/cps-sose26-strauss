## 1. Hardware-Spezifikationen im Vergleich

| Feature | Arduino MKR WiFi 1010 | M5StickC Plus2 |
| :--- | :--- | :--- |
| **Mikrocontroller** | SAMD21G18A (ARM Cortex-M0+) | ESP32-PICO-V3-02 (Dual-Core) |
| **Taktfrequenz** | 48 MHz | 240 MHz |
| **SRAM** | 32 KB | 520 KB (SRAM) + 2 MB PSRAM |
| **Flash-Speicher** | 256 KB | 8 MB |
| **Konnektivität** | u-blox NINA-W102 (WiFi/BT 4.2) | ESP32 Native (WiFi/BT 5.0 Dual Mode) |
| **Peripherie** | 6x SERCOM, 12-ch DMA, 10-bit DAC | 1.14" LCD, RTC (BM8563), Mic, IMU, IR |
| **Stromversorgung** | BQ24195L (I2C-gesteuerter Lader) | Integrierter 200mAh Akku (3,7V) |
| **Preis** | ~38 € | ~22 € |

---

## 2. Szenarien-Analyse

### Szenario A: Batteriebetriebener Umweltsensor (Temperatur/Feuchtigkeit)
**Wahl: Arduino MKR WiFi 1010**

Der SAMD21G18A verfügt über ein 12-Kanal Event-System, das Peripherieaufgaben ohne CPU-Intervention erlaubt. In Verbindung mit dem integrierten Lade-Controller kann ein großer externer Akku genutzt werden, um die 10-minütigen Sendeintervalle über Monate hinweg zu puffern.

### Szenario B: Handheld-Gerät mit Bildklassifizierung (KI)
**Wahl: M5StickC Plus2**

Die 240 MHz Dual-Core CPU ist für KI-Inferenz, wie bei neuronalen Netzen, erforderlich. Mit 2 MB PSRAM bietet das Gerät genug Platz für Bildpuffer; der Arduino würde bei Bilddaten aufgrund seiner 32 KB SRAM Out of Memory laufen.

---

## 3. IoT-Referenzarchitektur & Integration

### Kombination der Geräte
Man würde den M5StickC als mobilen Terminal nutzen, um Befehle zu geben, während der Arduino MKR 1010 als stationäre Station im Außenbereich die Sensordaten sammelt und sicher an ein Cloud-Backend sendet. Ein drittes Gerät könnte als lokaler Edge-Gateway dienen, um die WiFi-Last zu reduzieren und Daten lokal zu speichern

### Zuordnung zur Referenzarchitektur
Schicht 1: Device / Node.
- Sensor/Actuator: Der Arduino fungiert hier als Host für externe Sensoren, während das M5StickC interne Sensoren nutzt.
- Physical Interaction: Das M5StickC ermöglicht durch sein Display und die Buttons eine direkte physische Interaktion mit dem Nutzer.

Schicht 2: Edge (local) Gateway 
- Kombination: Hier könnte man beide Geräte kombinieren. Der Arduino sammelt Daten, während das M5StickC als lokaler Edge-Knoten fungiert, der die Daten verarbeitet und über die LAN-Infrastruktur an das Backend weitergibt.

Schicht 3: Cloud Backend & Dashboard 
- Beide Geräte senden ihre Ergebnisse an das Cloud Backend zur Speicherung in der DB. Die Visualisierung erfolgt im Dashboard, wobei der Nutzer über Virtual Interaction (z.B. Smartphone-App) auf die Daten des Umweltsensors zugreifen kann.