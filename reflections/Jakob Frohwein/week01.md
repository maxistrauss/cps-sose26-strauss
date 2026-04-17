## 5. Reflexion – Woche 1

### Erwartungen
Grundlagen von IoT und CPS verstehen und einen praxisnahen Einstieg bekommen.

### Takeaway
- Unterschied zwischen IoT und CPS verstanden  
- CPS arbeitet mit Control Loop  
- Viele Systeme sind Hybrid (IoT + CPS)

### Was war gut?
Alles war verständlich erklärt und gut nachvollziehbar.

### Was war schwierig?
Es gab keine größeren Schwierigkeiten.

### Struggling / Exploration
Keine Probleme, die Aufgaben waren gut machbar.

### Selbsteinschätzung
Ich habe die Inhalte verstanden und die Aufgaben schnell erledigt.

### Zusammenarbeit
Ich habe selbstständig gearbeitet.

### Hilfe und extra Arbeit
Kein Bedarf an Hilfe.

---------
---------
noch meine Lösung
-----------------------------------------------------------------------------
## 1. Five IoT domains:

    Smart Home, Smart City, Helthcare, Industrie, Landwirtschaft


## 2. IoT Protokolle
- MQTT 
- CoAP 
- HTTP  



## 3. Typische Geräte

### Arduino
- Mikrocontroller für Prototyping 
- Vorteil: einfache Programmierung und günstige Hardware

### Raspberry Pi
- Single-board Computer mit Linux  
- Vorteil: höhere Rechenleistung für komplexe Anwendungen

### ESP32
- Mikrocontroller mit integriertem WLAN   
- Vorteil: ideal für IoT Anwendungen durch Netzwerkfähigkeit

### Sensoren und Aktuatoren
- Sensoren messen physische Größen (z. B. Temperatur)
- Aktuatoren beeinflussen die reale Welt (z. B. Motoren)
- Vorteil: ermöglichen Interaktion mit der physischen Umgebung



## 4. CPS Systeme

### 1. Smart Thermostat
- Sensor: misst die Temperatur
- Controller: entscheidet, ob geheizt oder gekühlt wird
- Aktuator: Heizung oder Klimaanlage
- Feedback: neue Temperatur wird wieder gemessen

**Control Loop:**  
Physical process (Raumtemperatur) → Sensor → Controller → Aktuator → Feedback

---

### 2. Autonomes Fahrzeug
- Sensoren: Kamera, Radar, Lidar
- Controller: berechnet Fahrentscheidungen
- Aktuatoren: Lenken, Bremsen, Beschleunigen
- Feedback: Umgebung wird kontinuierlich neu erfasst

**Control Loop:**  
Umgebung → Sensoren → Controller → Aktuatoren → Feedback

---

### 3. Drohne
- Sensor: Gyroskop, GPS
- Controller: Flugsteuerungssystem
- Aktuatoren: Motoren
- Feedback: Stabilität und Position werden ständig angepasst

**Control Loop:**  
Flugzustand → Sensor → Controller → Motoren → Feedback

---

### 4. Industrielle Maschine (Predictive Maintenance)
- Sensor: misst Vibrationen oder Geräusche
- Controller: analysiert Zustand der Maschine
- Aktuator: Wartungssignal oder Anpassung
- Feedback: neue Messwerte zeigen Zustand

**Control Loop:**  
Maschinenzustand → Sensor → Analyse → Aktion → Feedback



## 5. Hybrid CPS/IoT System

### Tesla Fahrzeug mit Tesla App

Ein Tesla Fahrzeug in Kombination mit der Tesla App ist ein
Hybrid aus Cyber-Physical System (CPS) und Internet of Things (IoT).

Es ist ein CPS, da das Fahrzeug physische Prozesse aktiv steuert.
Sensoren wie Kameras und Radar erfassen die Umgebung, ein
Steuerungssystem verarbeitet die Daten und Aktuatoren steuern
Lenkung, Bremsen und Beschleunigung. Dies bildet einen klassischen
Control Loop (Sensor → Controller → Aktuator → Feedback).

Gleichzeitig ist das System ein IoT-System, da das Fahrzeug mit
dem Internet und der Tesla App verbunden ist. Das Auto sendet
Daten an die Cloud und kann über die App gesteuert werden
(z. B. Türen öffnen, Klimaanlage starten oder Software-Updates).

Daher kombiniert das System sowohl die physische Steuerung
(CPS) als auch die Vernetzung und Kommunikation (IoT) und ist
somit ein Hybrid-System.



## Hilfe: Ihre Folien, ChatGPT sowie googeln :)




