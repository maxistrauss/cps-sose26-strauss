## 3. Documentation (Deliverable)

### Functional Description

The hardware integration shifts from simulated virtual inputs to real-world physical feedback loops. The system splits tasks across the microcontrollers via the ArduinoMqttClient framework over local Wi-Fi:

* Sensor Layer: The environment tracking node accesses the integrated HTS221 sensor on the MKR Carrier, sample-filtering raw temperatures and pushing updates upstream to `building/room/temperature` every 2 seconds. A small extract of the data being sent from the Arduino can be seen [here](./temperature_read.png), which used this [code](./code/MKR1010_Carrier_Temp_MQTT/MKR1010_Carrier_Temp_MQTT.ino).
* Actuator Layer: The switch node subscribes to `building/room/heater/set`. Once the computer-hosted software integrator issues a control command, the client triggers an internal interrupt callback function, calling `carrier.Relay1.openIn()` or `closeIn()` to close or break the physical high-voltage contact circuit.

### Encountered Difficulties & Solutions

* Blocking Delay Loops: The initial code structure used a hard `delay(1000)` inside the main loop execution. This froze background TCP polling, causing the client to frequently disconnect from Mosquitto. Replacing this behavior with a non-blocking `millis()` time-delta execution cleared the data pipeline bottlenecks.
* Relay Initialization State: The relays remained unpowered or structurally non-responsive initially. Explicitly calling `carrier.begin()` at the top of the execution setup resolved this by properly enabling internal power rails across the board expansion busses.
* Trying to implement this with our Windows PCs produced some errors when we tried to flash the firmware onto our Arduino. That is why we used the Subscription-script from Tasks 1 and 3 to validate the functionality of the publishing temperature data and moved on to the rest of the tasks.