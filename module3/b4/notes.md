## 3. Documentation (Deliverable)

### Functional Description

The hardware integration shifts from simulated virtual inputs to real-world physical feedback loops. The system splits tasks across the microcontrollers via the ArduinoMqttClient framework over local Wi-Fi:

* Sensor Layer: The environment tracking node accesses the integrated HTS221 sensor on the MKR Carrier, sample-filtering raw temperatures and pushing updates upstream to `building/room/temperature` every 2 seconds.
* Actuator Layer: The switch node subscribes to `building/room/heater/set`. Once the computer-hosted software integrator issues a control command, the client triggers an internal interrupt callback function, calling `carrier.Relay1.openIn()` or `closeIn()` to close or break the physical high-voltage contact circuit.

### Encountered Difficulties & Solutions

* Blocking Delay Loops: The initial code structure used a hard `delay(1000)` inside the main loop execution. This froze background TCP polling, causing the client to frequently disconnect from Mosquitto. Replacing this behavior with a non-blocking `millis()` time-delta execution cleared the data pipeline bottlenecks.
* Relay Initialization State: The relays remained unpowered or structurally non-responsive initially. Explicitly calling `carrier.begin()` at the top of the execution setup resolved this by properly enabling internal power rails across the board expansion busses.