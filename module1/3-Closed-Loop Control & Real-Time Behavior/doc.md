# Aufgabe: Simulation eines Heizung Systems
In dieser Aufgabe wurde Code bereitgestellt, welcher einen beheizten Raum mit Temperaturverlust und
Heizung Controlling System simuliert. Regelung läuft nur alle 100 ms (control_hz=10 Hz), mit Messrauschen, Heizungsbegrenzung und Verzögerungen. Parameter: Kp=2.0, Ki=0.5, Kd=0.5, latency=0.1s, jitter=0.01s.

## Open Loop
Die Heizung läuft immer mit gleicher Leistung (u=3.0). Es gibt keine Rückmeldung von der Temperatur. Deshalb steigt die Temperatur einfach an und überschießt den Zielwert deutlich. Das zeigt: Ohne Rückkopplung kann man Störungen nicht ausgleichen.

## P-Regler
Der Regler schaltet proportional zum Temperaturfehler. Die Raumtemperatur kommt dem Ziel nahe, aber es gibt Überschwingen und leichte Schwingungen danach. Es bleibt ein kleiner Abstand zum Zielwert, weil konstante Störungen nicht vollständig wegkompensiert werden.

## PD-Regler
Zum P-Anteil kommt noch der D-Teil dazu, der auf schnelle Änderungen des Fehlers reagiert. Dadurch schwingt weniger stark und die Temperatur beruhigt sich schneller. D wirkt also dämpfend, ist aber rausch-empfindlich.

## PI-Regler
Der I-Anteil summiert alte Fehler auf und soll den Restfehler beseitigen. Stattdessen schwingt das System stark hin und her, weil der Regler zu spät korrigiert. Das Heizsignal geht immer wieder hoch und runter. Der zu große Integral Anteil sorgt also für Instabilität.


## Abtastrate, Verzögerung und Jitter
Bei nur 10 Hz Abtastrate sieht der Regler das System zu selten, was wie eine Verzögerung wirkt. Die extra Latenz (0.1 s) verstärkt diesen Effekt und der Heizbefehl kommt zu spät an. Jitter macht die Verzögerung unregelmäßig, was die Schwingungen verstärkt. Ergebnis: Weniger Stabilität, mehr Überschwingen. Höhere Abtastrate und feste Zeiten wären besser.