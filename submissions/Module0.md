# Module 0 - Introduction (GitLab+ELO Submission 1.4.2026)
#### von Michael Amann, Oliver Masur, Jakob Frohwein, Maximilian Strauß, Philipp Zausinger

<br>

## Task 4

### Five IoT Domains

- **Smart Home**
For example with Connected Light Bulbs

- **Smart City**
For example to collect and analyze air quality

- **Smart Agriculture**
For example to collect and analyze crop/soil data

- **Connected Vehicles**
For example with smart vehicles (that include many different sensors) for autonomous driving or safety features 

- **Healthcare**
For example to analyze the location of medical devices and technological assets for maintenance, logistics, and service management

### Three commonly used (data) protocols in IoT Systems

- MQTT
- CoAP
- HTTPS (REST)

### Four typical devices (appliance or micro controller). What could be the benefit of IoT?

- Microcontrollers like Arduino or ESP32
- Single Board Computers like Raspberry Pi or enterprise models like AAEON UP Squared™
- Sensors like audio sensors or RFID Sensor

**Benefits**

- Low-Power Consumption
- Automation
- Accurate Analysis and Decision-making
- Real-Time Data Analysis

### Three CPS systems - describe their control loop!

- **Smart thermostat**

A temperature sensor measures the current room temperature.
The controller compares it with the target temperature.
If the room is too cold, it switches the heater on. If it is too warm, it activates cooling or turns heating off.

- **Autonomous car**

Sensors such as radar, cameras, or lidar detect the distance to other cars and the vehicle speed.
The control software calculates whether the car should accelerate, brake, or steer.
The actuators apply throttle, brakes, or steering adjustments.
The car’s motion changes, and the sensors immediately measure the new situation again.

- **Segways**

Sensors measure the tilt of the segway.
When the segway is leaning forward, signals are sent to the motor to accelerate.
When the segway is leaning backware, signals are sent to the breaking system to break. 
Sensors repeat this process to adapt and move as the user intends to. 

### One Hybrid CPS/IoT system - Justify your classification (¼ page)

The mentioned **Smart Thermostat** is a great example as a hybrid CPS/IoT System.

The smart thermostat consists of a controlled feedback loop that not only gathers information about the room temparature but also interacts with the physical environment by actively cooling or heating the room. This combination of computing the gathered information as well as interacting with the physical environment makes this product a typical example of a Cyber-Physical System (CPS). 

In addition to this behaviour, smart thermostats are also considered IoT Devices because they are often interconnected with multiple sensors and are connected to the internet in form of some Cloud Service. This connectivity is used to send and retrieve data to interact with it as well as view the measured data. One example is the interaction between the owner and the smart thermostat. If the owner wants to view the current room temperature and maybe adjust the target temperature for when to start cooling, then he/she can do so using the designated web-page, that allows this control. Another use-case is the dashboard of the thermostat that is included depending on the specific product, which could show the temperature over time for example. 

These two mentioned aspects combine the characteristics of CPS and IoT systems, which results in a hybrid CPS/IoT System.

## Task 5

*siehe Reflections*

## Ressources

Ziegler, S., Radócz, R., Quesada Rodriguez, A., & Nieves Matheu Garcia, S. (Eds.). (2024). Springer Handbook of Internet of Things. Springer.https://doi.org/10.1007/978-3-031-39650-2 

ChatGPT 5.4