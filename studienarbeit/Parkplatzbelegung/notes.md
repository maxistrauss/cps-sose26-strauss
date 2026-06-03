## Information on Parkplatzbelegung

### Components

**Distance Sensor**
- ESP8266
- HC-SR04 Distance Sensor
- Jumper cables
- 1k Resistors

**LED**
- ESP8266
- WS2401R 1 LED Strip Shield

### Wiring

**LED**

Place the LED Shield onto the ESP8266

**Distance Sensor**

I used D1 and D2 for GPIO. 

The exact can be seen [here](./ressources/project_parkbelegung_wiring.png).

### Communication

Distance Sensor sends to the MQTT Broker on topic "sensors/ultrasonic/1":

    - "true" if distance is smaller then threshold (Object/Car stands on parkingLot) --> Parking Lot is occupied
    - "false" if distance is greater then treshold (NO Object/Car stands on parkingLot) --> Parking Lot is empty
    - NO sensor data is published if there are errors when sensing the data

Node-RED logic sends color to LED on topic "LED/led/rgb/set":

    - "green" if parking lot is empty
    - "red" if the parking lot is occupied

Node-RED logic sends sensor-id and sensor color to Dashboard on topic "controll/dashboard/parkplatzbelegung":

    - "sensor1_green" if parking lot is empty
    - "sensor1_red" if parking lot is occupied
    - Structure of mqtt topic data is crucial!
    - This adds scalability as different sensor can send to this topic with "sensor2_red", "sensor3_green", etc.
    - Within the ui-template, those sensor-ids (sensor1, sensor2, sensor3) need to be added!
    - Within the ui-template, the color of each sensor changes whenever a message from the respective sensor arrives!

### Logic

---

#### Distance Sensor

The distance sensor is based on an HC-SR04 ultrasonic module connected to an ESP8266. It continuously measures the distance to nearby objects and publishes a binary occupancy state via MQTT.

**Measurement Process**

1. A trigger pulse is sent to the ultrasonic sensor.
2. The sensor emits an ultrasonic sound wave and waits for the echo to return.
3. The round-trip travel time of the sound wave is measured.
4. The distance is calculated using the speed of sound.

**Noise Filtering**

To improve measurement reliability, the sensor does not rely on a single reading:

- Up to **15 measurement attempts** are performed.
- **5 valid distance readings** are collected.
- Invalid readings (timeouts or missing echoes) are discarded.
- The **median** of the 5 valid readings is used as the final distance value, reducing the influence of outliers and measurement noise.

**Connectivity**

The ESP8266 connects to:

- A Wi-Fi network for network access.
- An MQTT broker for communication with the IoT platform.

If either connection is lost during startup, the device continuously retries until a connection is established.

**Occupancy Detection Logic**

The measured distance is compared against a fixed threshold of **100 cm**:

| Measured Distance | Published Value |
|-------------------|-----------------|
| Less than 100 cm | `true` |
| Greater than or equal to 100 cm | `false` |
| Invalid measurement | No message published |

The result is published every second to the MQTT topic:

```text
sensors/ultrasonic/1
```

This allows other components of the system to determine whether an object is present within the monitored area and react accordingly.

#### To Do

- Adjust the threshold
- MQTT and Wifi reconnect in the loop
- Adjust Pin comments
- make the threshold a constant: #define DETECTION_DISTANCE 100.0


---

#### Node-RED Flow

#### Node-RED Flow

The Node-RED flow receives the binary distance sensor state and converts it into a stable parking-space status. Instead of reacting immediately to every single sensor value, it uses a sliding window to reduce flickering and avoid false LED/dashboard updates caused by short measurement errors.

**Input Data**

The flow receives boolean values from the ultrasonic sensor:

| Incoming Value | Meaning |
|---------------|---------|
| `true` | Object detected |
| `false` | No object detected |

The sensor data is received through the MQTT topic:

```text
sensors/ultrasonic/1
```

**Sliding Window Logic**

To make the decision more stable, the flow stores the most recent sensor values in a sliding window.

The window size is set to **5 values**:

```js
const WINDOW_SIZE = 5;
```

For every new incoming value:

1. The newest value is added to the beginning of the window.
2. Older values are shifted back.
3. If the window contains more than 5 values, the oldest value is removed.
4. The updated window is saved in the Node-RED flow context.

This allows the flow to evaluate the recent sensor history instead of only the latest measurement.

**Decision Logic**

The flow checks how many values inside the sliding window are `true` or `false`.

A threshold of **80%** is used:

```js
const THRESHOLD = 0.8;
```

This means at least 4 out of 5 values must agree before the LED state changes.

| Sliding Window Result | Output State | Meaning |
|----------------------|--------------|---------|
| At least 80% `true` | `RED` | Object detected / parking space occupied |
| At least 80% `false` | `GREEN` | No object detected / parking space free |
| No clear majority | `KEEP` | Keep the previous state |

The `KEEP` state prevents unstable sensor readings from constantly switching the LED color.

**LED Control**

After the decision logic, the flow uses a switch node to react to the calculated state:

| State | LED Behavior |
|------|--------------|
| `RED` | Set LED to red |
| `GREEN` | Set LED to green |
| `KEEP` | Do not change the LED |

This ensures that the LED only changes color when the sensor data is stable enough.

**Dashboard Message Format**

Before sending the state to the dashboard, the payload is converted into a sensor-specific format:

```text
sensor1_GREEN
sensor1_RED
```

This is done by combining the sensor ID with the current state:

```js
let temp = "sensor1_" + msg.payload
msg.payload = temp
```

This format makes it possible to handle multiple sensors later, for example:

```text
sensor2_GREEN
sensor3_RED
```

**Dashboard Visualization**

The dashboard uses a UI template to display a parking lot image with status LEDs placed on top of it.

Each sensor has:

- A unique sensor ID.
- An `x` position.
- A `y` position.

Example:

```js
{ id: "sensor1", x: 720, y: 275 }
```

When the dashboard receives a payload like:

```text
sensor1_RED
```

it splits the message into:

| Part | Value |
|------|-------|
| Sensor ID | `sensor1` |
| State | `RED` |

The matching LED on the parking lot image is then updated visually.

**Visual States**

| State | Dashboard Color |
|------|-----------------|
| `GREEN` | Green LED |
| `RED` | Red LED |

If no state has been received yet, the dashboard uses `GREEN` as the default state.

**Overall Flow Behavior**

The Node-RED flow acts as a filtering and visualization layer between the distance sensor and the user interface.

It receives raw boolean sensor values, smooths them using a sliding window, decides whether the parking space is occupied or free, updates the physical LED, and sends the same state to the dashboard.

This makes the system more reliable because short sensor glitches do not immediately affect the displayed parking-space status.


---

#### LED

The led is flashed using IoTempower using the led_strip command (within setup.cpp). Hence, it listens to certain topics and changes the color accordingly. Apart from this, no additional logic was implemented.

### URL to Dashboard:

http://127.0.0.1:1880/dashboard/parkinglot

Link to an image of the [Dashboard](./ressources/Parkplatzbelegung_dashboard.png).

