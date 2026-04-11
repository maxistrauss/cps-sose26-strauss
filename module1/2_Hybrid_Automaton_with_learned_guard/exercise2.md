## Exercise 2: Hybrid automaton with learned guard

### Hybrid automaton for the thermostat (A)

**States** = {Cooling, Waiting}

**Allowed Transitions:** 

    1) Cooling -> Waiting
    2) Waiting -> Cooling

**Continuous Variables:**

    1) While Cooling: Temperature T = -0.5/s
    2) While Waiting: Temperature T = 0.1/s

**Extended Transition rules:**

    1) Cooling -> Waiting : when T <= 19
    2) Waiting -> Cooling : when T >= 26

Guards are implemented by the difference in temperatures between Cooling and Waiting in the extended transition rules.

Reset maps did not need to be implemented for this example!

### B)

A binary classifier is a model that takes the input and based on this data outputs either true or false based on the use-case and application of the model.

**False positive:** The classifier predicts that the guard T >= 26°C is true although the actual temperature is below 26°C. For example, the true temperature is 25.8°C but sensor noise makes the measured temperature 26.3°C, so the thermostat switches from Wait to Cool too early. This leads to unnecessary cooling and energy waste.

**False negative:** The classifier predicts that the guard T >= 26°C is false although the actual temperature is already above 26°C. For example, the true temperature is 26.4°C but sensor noise makes the measured temperature 25.7°C, so the thermostat stays in Wait instead of switching to Cool. This can let the room overheat and violate the desired temperature bound.

### C)

In the described hybrid automaton, we already implemented a hysteresis band by having two separate values for when to start and stop cooling. This method prevents rapid changes of states and therefore a quick succession between turning on and off the heater. 

Another new aspect, that can help the CPS work more robust, is the introduction of confidence thresholds for the binary classifier. 

**Modification:** Introduce a confidence threshold for the classifier-based guard. The thermostat switches states only if the classifier assigns a sufficiently high probability (e.g., ≥ 0.9) to the predicted output.

**Benefit:** This approach improves robustness to noisy sensor data by filtering out uncertain predictions near the state transformation values. Consequently, the system is less prone to incorrect or unnecessary mode switches caused by measurement noise.



    