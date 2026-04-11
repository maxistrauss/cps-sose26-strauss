## Results Overview

| Run | Model                | MSE (Test) | Negative Predictions |
| --- | -------------------- | ---------- | -------------------- |
| A   | Model A (no penalty) | 0.0195     | 70                   |
| A   | Model B (penalty)    | 0.0164     | 1081                 |
| B   | Model A (no penalty) | 0.0403     | 89                   |
| B   | Model B (penalty)    | 0.0240     | 20                   |
| C   | Model A (no penalty) | 0.0215     | 96                   |
| C   | Model B (penalty)    | 0.0239     | 1190                 |



## Interpretation (kurz)

* Bei allen Modellen und Runs fällt der MSE im Training (ab ~2000 Epochen) unter 0.1 → gute Approximation der Dynamik.

* Beide Modelle lernen die grundlegende Bewegung des Systems zuverlässig.

* Zusatzversuch: Penalty für negative (x)-Werte (Model B).

* Idee: negative Vorhersagen bestrafen, damit das Modell positive Werte lernt.

* Ergebnis: funktioniert nicht zuverlässig.

  * In einigen Runs Verbesserung (z. B. Run B)
  * In anderen Runs deutlich mehr negative Werte (Run A, C)

* Problem: Penalty sagt nur „negativ ist falsch“, aber nicht, was der korrekte Wert ist.

* Dadurch kann das Lernen verzerrt werden und bleibt instabil.

* Alternative: negative Werte nachträglich begrenzen (z. B. auf 0 setzen) oder physikalische Struktur explizit modellieren.

* Fazit: Penalty allein ist kein zuverlässiger Ansatz.
