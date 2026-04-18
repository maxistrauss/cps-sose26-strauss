## Task B2: Local development “Hello Blink”, “Hello MKR”

For this task, we installed the Arduino IDE onto our local machines and ran all the scripts from there. So no VM was needed for this task. 

After installing the IDE, we installed the necessary libraries as required in the exercise sheet.

During the next step, we unplugged the MKR Carrier Board from the Arduino and connected the device with our Laptop using the provided USB-cable. 

#### Blinking script

Next, we ran the [Blinking](/code/Blink.ino) script, which ran normally and led to the led to blink on the Arduino ([Screenshot of IDE](/docs/blink.png)). 

To modify the blink-frequency, we changed the parameter of the delay function in line 36 of the linked code. 

#### Relays_Blink script

Next, we reconnected the MKR Carrier Board and ran the example code [Relays_blink](/code/Relays_blink.ino) ([Screenshot of IDE](/docs/actuator_relay.png)).

During this step, there were also no errors or problems. 

#### Touch and LED script

For this step, there was already an example script provided, which we could use. It is located at: File > Examples > Arduino_MKRIoTCarrier > Touchpads > Touch_and_LEDs. After compiling the script, we could use the touchpads of the MKR Carrier Board and the LED would light up. 

Unfortunately, we had some starting problems as the code compiled normally, but the LED would not light up. It seemed that tweaking the serial.begin parameter in line 7 of the used [script](/code/Touch_and_LEDs_115200.ino) resolved this issue ([Screenshot of IDE](/docs/touch_led.png)). 

The light up LED can be seen [here](/docs/LED_with_Touch.jpg).
