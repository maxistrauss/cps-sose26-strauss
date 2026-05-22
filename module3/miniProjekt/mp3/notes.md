# Task 3: The Project

## A) Use Case and System Context

### Use Case

The system is used as an **electronic access control system for a university electronics laboratory**.  
Only authorized students, professors, and lab assistants are allowed to enter the room using RFID cards.

The goal is to:
- prevent unauthorized access,
- automatically lock the door after entry,
- provide clear visual and acoustic feedback,
- and improve security for expensive laboratory equipment.

---

### Installation Location

#### Main Entrance Door

The complete system is installed at the **main entrance of the laboratory room**.

---

### Component Placement

#### Outside the Room (Access Side)

These components are mounted next to the door:

##### RFID Reader

- Installed at hand height beside the door.
- Users hold their RFID card/tag in front of the reader.

##### RGB LED

- Mounted above the RFID reader.
- Indicates system status:
  - Green = access granted
  - Red = access denied

##### Display

- Installed near the RFID reader.
- Shows messages such as:
  - “Scan Card”
  - “Access Granted”
  - “Access Denied”

##### Buzzer

- Mounted inside the housing.
- Produces:
  - short confirmation tone for valid access
  - unpleasant warning tone for denied access

---

#### Inside the Room (Secure Side)

##### Relay

- Connected to the controller.
- Switches power to the locking mechanism.

##### Magnetic Drawer Lock / Solenoid or Servo

- Installed directly on the door locking mechanism.
- Unlocks briefly after successful authentication.
- Automatically locks again after a few seconds.

##### Microcontroller

- Installed in a protected box inside the room so it cannot easily be manipulated from outside.

---

### Security Zones

#### Public Zone (Outside)

- Anyone can reach the RFID reader and display.
- No direct access to the locking electronics.
- Only authentication happens here.

#### Secure Zone (Inside)

Contains:
- relay,
- controller,
- power supply,
- and locking mechanism.

Protected against tampering.

This separation increases security because attackers cannot directly access the critical hardware from outside the room.

---

## System Specification

A Diagram for the System Specifications as well as a Flow-chart can be found [here](./ressources/mp.png)

### Project Overview

The system is an IoT-based RFID access control solution designed for a university electronics laboratory.

Authorized users can unlock the door using either:
- an RFID tag/card
- or a password entered on the IoT MKR Carrier

The system uses MQTT communication between sensors, logic services, and actuators.

---

## System Architecture

### Central MQTT Broker

The MQTT Broker runs on a Raspberry Pi and acts as the communication hub between all system components.

#### MQTT Broker Specifications

- Device: Raspberry Pi
- Protocol: MQTT
- Local IP Address: `192.168.1.21`
- Port: `1883`

---

### Main MQTT Topics

These topics are called differently according to the specification of IoTempower. To be changed.

| Topic | Purpose |
|---|---|
| `mp/rfidReader/uuid` | RFID reader publishes scanned UUID |
| `mp/passwordLogin` | Password device publishes entered password |
| `mp/access` | Authentication services publish access result |
| `mp/servo` | Controls servo motor |
| `mp/display` | Sends messages to display |
| `mp/rgbled` | Controls RGB LED status |
| `mp/buzzer` | Controls buzzer sounds |

---

## System Components

### RFID Reader

#### Function

- Reads RFID card/tag UUID
- Publishes UUID to MQTT broker

#### MQTT Communication

**Publish:**
- `mp/rfidReader/uuid`

---

### Password Login Device (Arduino IoT MKR Carrier)

#### Function

- Allows alternative authentication via password
- Publishes password input to MQTT broker

#### MQTT Communication

**Publish:**
- `mp/passwordLogin`

---

### Authentication Service (MQTT Logic 1)

#### Function

- Subscribes to RFID UUID topic
- Checks whether UUID is authorized
- Publishes access result

#### Workflow

##### Valid UUID
- Publish `"granted"` to access topic

##### Invalid UUID
- Publish `"denied"` to access topic

#### MQTT Communication

**Subscribe:**
- `mp/rfidReader/uuid`

**Publish:**
- `mp/access`

---

### Password Validation Service (MQTT Logic 3)

#### Function

- Checks entered password
- Publishes access result

#### Workflow

##### Correct Password
- Publish `"granted"`

##### Incorrect Password
- Publish `"denied"`

#### MQTT Communication

**Subscribe:**
- `mp/passwordLogin`

**Publish:**
- `mp/access`

---

### Access Control Service (MQTT Logic 2)

#### Function

- Receives access status
- Controls all output devices

#### Workflow

##### Access Granted

- RGB LED turns green
- Display shows access granted
- Servo unlocks door
- Optional success tone
- Door automatically relocks after timeout

##### Access Denied

- RGB LED turns red
- Display shows access denied
- Buzzer emits warning tone
- Door remains locked

#### MQTT Communication

**Subscribe:**
- `mp/access`

**Publish:**
- `mp/servo`
- `mp/display`
- `mp/rgbled`
- `mp/buzzer`

---

## Output Devices

### RGB LED

#### Status Indicators

| Color | Meaning |
|---|---|
| Green | Access granted |
| Red | Access denied |

---

### Display

#### Example Messages

- `Scan RFID Card`
- `Access Granted`
- `Access Denied`

---

### Buzzer

#### Function

- Emits acoustic feedback

#### Sounds

| Situation | Sound |
|---|---|
| Access granted | Short confirmation tone |
| Access denied | Unpleasant warning tone |

---

### Servo Motor / Solenoid Lock

#### Function

- Unlocks door when access is granted
- Relocks automatically after timeout

#### Security Behavior

- Default state is locked
- If communication fails, lock remains closed

---

## System Workflow

1. User selects login method
2. User scans RFID card or enters password
3. Credentials are sent to MQTT broker
4. Authentication service validates credentials
5. Access result is published
6. Access control service activates outputs

---

### Access Granted Workflow

1. Access status = `"granted"`
2. RGB LED turns green
3. Display shows success message
4. Servo unlocks door
5. Door relocks automatically after timeout

---

### Access Denied Workflow

1. Access status = `"denied"`
2. RGB LED turns red
3. Display shows denied message
4. Buzzer emits warning tone
5. Door remains locked

# Demo

link to demo: [demo1](./ressources/iot_demo1.mp4) [demo2](./ressources/iot_demo2.mp4).

link to flows: [flow1](./ressources/flows(1).json) [flow2](./ressources/flows(2).json) [flow3](./ressources/flows(3).json)

