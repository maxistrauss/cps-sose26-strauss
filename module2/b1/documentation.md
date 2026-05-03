## B1 - Cloud Device Connection

For this exercise, we followed the steps in the tutorial and added two new devices (one ESP8266 and one Arduino) and one Thing each. 

The hardware can be seen [here](./screenshots/hardware.jpeg) and the respective devices in Arduino Cloud [here](./screenshots/devices.png). 

To complete this task, we used the scenario with the fire alarm. 

For this, we had three components in total:

- ESP8266 as a Trigger to start the alarm
- Arduino to deactivate the alarm
- Arduino Dashboard/Cloud to store the state


To get the state of the fire alarm, we created two variables in the Arduino Cloud.

- The state of the fire alarm (button_press)
- The pin to disarm the fire alarm

The variables can be seen [here](./screenshots/arduino_Thing_vars.png).

Next, we implemented the code to set off the fire alarm with the button of the ESP8266. 

The code for the ESP8266 can be found [here](./code/ESP_sketch.ino). 

As basic implementation, this fire alarm can be disabled within the dashboard with a normal switch. 

The dasboard for this exercise can be seen [here](./screenshots/b1_dashboard.jpeg). 

### Extension

The extension of this exercise consists of disabling the firealarm with the use of the MKR IoT Carrier. 

The pin can be set in the dashboard. 

Our feature involved the following requirements: 

- When the alarm is set off, the MKR IoT Carrier can be used to disarm it
- The correct pin (of the dashboard) needs to be entered to disarm the alarm
- The pin needs to be confirmed with the Touchpad 0
- The state of the alarm is displayed on the colour-screen of the MKR IoT Carrier

The code for those requirements can be found [here](./code/Arduino_sketch.ino).

The demo for this exercise can be found [here](./screenshots/demo.mp4)(screenshot of the dashboard with the [serial monitor](./screenshots/dashboard_serial_monitor.png)). 



