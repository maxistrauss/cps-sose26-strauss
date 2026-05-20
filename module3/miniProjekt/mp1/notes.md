## Task 1: RFID-Reader mit Node-RED

For this task, we connected the RFID Reader to the ESP8266 according to the documentation server. An Image of the RFID wire up can be found [here](./screenshots/).

After this step, we created a Node-Red Flow. This flow checks if the UID is valid and changes the button accordingly. 

At the beginning, we created a global list of UIDs in a function Node. After that, it is checked, if the UID is in this global list. If it is, the button turns green. If the UID is wrong, then the button is green. 

When the button is pressed, it is reset to Blue and the Text is back to "Scan Tag". 

The flow can be seen [here](./screenshots/MP1_node_red_flow.png).

The flow of the json can be found [here](./screenshots/MP1_RFID.json). 

A quick demo can be found [here](./screenshots/Screencast%20from%202026-05-20%2018-33-14.webm). This demo does not inlcude the MQTT as the RFID sensor was not setup, when this task was finished. 

But the RFID Sensor does send correct data as can be seen in this [screenshot](./screenshots/Screenshot%20from%202026-05-20%2015-24-28.png). 