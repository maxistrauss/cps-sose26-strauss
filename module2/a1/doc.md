# How does Activity 2 'Graph data in the cloud' relate to the IoT reference model? Are all elements present?
- Der Arduino MKR IoT Carrier fungiert als Device / Node und nutzt Sensoren, um Temperatur und Luftfeuchtigkeit zu messen
- Das Board verbindet sich über das lokale Netzwerk (LAN Infrastructure) mit dem Cloud Backend (der Arduino IoT Cloud)
- Die gesammelten Daten werden dort in einer Datenbank (DB) gespeichert und über ein Dashboard für den Nutzer visualisiert
- Fehlende Elemente: Es fehlen die Aktuatoren. Der Informationsfluss ist unidirektional (vom Gerät in die Cloud); es findet keine steuernde Virtual Interaction statt.

# What else does Activity 4 "Remote trigger" add?
- Durch die Definition von "READ/WRITE"-Variablen im Cloud-Dashboard kann der Nutzer aktiv Befehle an das Gerät senden.
- Werden diese Werte im Dashboard geändert, rufen automatisch generierte Funktionen (wie onMessageChange() oder onRgbChange()) physische Reaktionen auf dem Carrier hervor.
- Das Gerät reagiert daraufhin als Aktuator, indem es den Bildschirm einfärbt, Warntexte anzeigt oder die LEDs steuert.
# What are the advantages and disadvantages of the classroom tracker or home security alarm? What would you change/improve?
- Vorteile: Das System kombiniert die Rotationswerte der Y-Achse des Gyroskops für die Tür und den PIR-Sensor für Bewegungen. Dadurch entsteht eine Logik, die den Durchgang erkennt.
- Nachteile: Die Erkennung der Türbewegung basiert auf starren Gyroskop-Schwellenwerten (> 50 oder < -50). Dies ist fehleranfällig, da sehr langsame Türbewegungen den Schwellenwert unter Umständen nicht erreichen.
- Verbesserungsvorschläge: Für eine zuverlässigere Türerkennung sollte anstelle des Gyroskops ein magnetischer Reed-Schalter (Fenster-/Türkontakt) verwendet werden. Dieser liefert einen absoluten Zustand (offen/geschlossen) anstatt nur einer relativen Bewegung. Außerdem sollte für den PIR-Sensor und den Zähler ein Mechanismus (Debouncing) im Code integriert werden, um Mehrfachzählungen bei einer einzelnen Bewegung zu verhindern.

# Which was the most complex program / activity and why?
Das schwierigste war Aufgabe 6. Es müssen zeitgleich Sensordaten ausgelesen und miteinander verknüpft werden. Parallel dazu muss das Display aktualisiert werden, die LEDs müssen die korrekten Statusfarben anzeigen und Funktionen wie der Remote-Reset, welcher akustisches Feedback integriert, müssen in den Programmablauf mit einfließen.
# Include your personal experience (did you like it or not, went seamlessly or was buggy/difficult) in a short reflection!
Der Einstieg unter Windows war durch massive Verbindungsprobleme zwischen dem Board und dem Cloud Agent geprägt. Erst durch Fehlersuche bei den COM-Ports, den Einsatz von KI-Unterstützung sowie die Hilfe des Dozenten konnten diese Fehler behoben werden.

Die bereitgestellten Anleitungen waren leicht zu verstehen. Dank der Präsenz vor Ort verlief auch die Zusammenarbeit in der Gruppe sehr effizient.