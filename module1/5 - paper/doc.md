# Paper: Safe and Efficient Reinforcement Learning Using Disturbance-Observer-Based Control Barrier Functions
#### Von Maximilian Strauß

Diese Zusammenfassung analysiert den [Artikel](./2211.17250v3.pdf) von Cheng et al. im Kontext von Cyber-Physical Systems (CPS). Die Publikation befasst sich mit der Integration von strengen Sicherheitsgarantien in Lernalgorithmen für dynamische Systeme.

## CPS context: what is the physical system and what is being controlled?
Der CPS-Kontext dieser Arbeit wird von zwei Anwendungsbeispiele in einer Simulation mithilfe eines Einrads (Unicycle) sowie eines 2D-Quadrocopters (Drohne) betrachtet.
Beim Einrad werden die lineare und angulare Geschwindigkeit (Geschwindigkeit + Drehung) gesteuert, um das System zu einem Ziel zu navigieren. Beim Quadrocopter regeln die Steuerungseingaben den Schub der Rotoren, um einer Referenz-Trajektorie zu folgen. In beiden Fällen interagiert wird eine Kontrollgröße eingeführt, um die realen Gegebenheiten zu simulieren (z. B. simulierter rutschiger Boden beim Einrad oder Luftwiderstand bei der Drohne)

##  Where is ML used (policy, perception, model, etc.)?
Machine Learning wird in diesem System ausschließlich für das Erlernen der Steuerungspolicy (Control Policy) eingesetzt. Das System nutzt modellfreies Reinforcement Learning (RL), spezifisch den Soft Actor-Critic (SAC) Algorithmus, um eine optimale Strategie zur Lösung der gestellten Navigationsaufgabe zu finden.
Ein zentrales Abgrenzungsmerkmal dieses Papers ist, dass das ML-Modell nur die Aktionen (Policy), aber nicht das physikalische Modell oder die Störungen lernt.

## What safety property (or performance guarantee) is desired?
Das primäre Sicherheitsziel, das das System erreichen muss, ist die strikte Einhaltung harter Zustandsbeschränkungen (Hard State Constraints) während des gesamten Trainings- und Einsatzprozesses. In der Praxis bedeutet dies, dass das System seinen vordefinierten, sicheren Zustandsraum niemals verlassen darf. Bei den Anwendungsbeispielen übersetzt sich dies in Kollisionsfreiheit mit Hindernissen oder das Verbleiben innerhalb eines definierten räumlichen Radius. Diese Sicherheitsbedingungen müssen während des gesamten Trainings und späteren Einsatzes eingehalten werden.

##  What technique is used to achieve or check safety (e.g., shields, barrier functions, reachability analysis, formal verification of a neural network)?
Um diese Sicherheit zu gewährleisten, verwendet das Paper einen Sicherheitsfilter (Safety Filter), der auf Control Barrier Functions (CBFs) basiert. Wenn die KI eine gefährliche Aktion vorschlägt, wird sie automatisch angepasst. Speziell wird eine Kombination aus einem Störgrößenbeobachter (Disturbance Observer, DOB), der Störungen (z. B. Wind) schätzt, und CBFs vorgestellt.
Der DOB schätzt in Echtzeit den genauen Wert der Unsicherheit/Störung und berechnet eine feste Fehlerschranke (Error Bound). Diese Informationen fließen in ein Quadratic Programming (QP) Modul ein, was ein Optimierungsverfahren ist. Wenn der RL-Agent eine Aktion vorschlägt, die die CBF-Bedingungen (also die Sicherheit) verletzen würde, greift der DOB-CBF-QP-Filter ein und modifiziert die Aktion minimal, sodass das System gerade noch im sicheren Bereich bleibt.

## How does the modeling viewpoint (hybrid systems, ODEs, automata) relate to the book’s notions?
Das Paper nutzt die Modellierungsperspektive der dynamischen Systeme, beschrieben durch Differentialgleichungen (ODEs). Die Bewegung des Systems ist kontinuierlich (Physik),
während die Steuerung durch den Algorithmus schrittweise erfolgt. Dadurch entsteht ein sogenanntes hybrides System, was durch kontinuierliche Dynamik (Physik) und diskrete Entscheidungen (KI und Optimierung) beschrieben wird. Dieser Ansatz verbindet klassische Regelungstechnik mit modernen Lernmethoden.

## Map the Paper to the "bouncing ball" example and compare their control architectures
Die Problematik unserer fehlschlagenden Penalty-Funktion beim Bouncing-Ball-Modell lässt sich mit dem Ansatz des Papers vergleichen. Während wir in unserem Notebook versuchten, dem neuronalen Netz die harte physikalische Begrenzung des Bodens (die Höhe x darf nicht negativ werden) lediglich durch eine Strafe im Training beizubringen, löst das Paper exakt solche Grenzen ("Hard State Constraints") mit einer besseren Kontrollarchitektur. Die Autoren verwenden Control Barrier Functions (CBFs) als Sicherheitsfilter. Übertragen auf die Bouncing-Ball-Simulation würde ein solcher Filter nicht darauf hoffen, dass das Modell den Fehler irgendwann selbst lernt, sondern er würde unsichere oder unmögliche Vorhersagen, wie das Durchschlagen des Bodens, in Echtzeit abfangen und minimal korrigieren. In Kombination mit dem Disturbance Observer (DOB) könnte eine solche Architektur dann sogar externe Störgrößen mathematisch schätzen und ausgleichen, ohne dass dafür erst ein komplett neues physikalisches Modell gelernt werden muss.

## Ressources

Yikun Cheng and Pan Zhao and Naira Hovakimyan. (2023). Safe and Efficient Reinforcement Learning Using Disturbance-Observer-Based Control Barrier Functions. arXiv. https://arxiv.org/abs/2211.17250

Gemini 3, ChatGPT 5.4