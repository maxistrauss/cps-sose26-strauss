## Reflection
In this week we had to do some practical first steps with the Arduino MKR 1010 micro controller. Before we were introduced in the lecture about general capabilities and differences of microcontrollers, single board computers and so on which was very interesting.

**Expectations & Takeaways**
I expected this lecture to get first insights into the arduino micro controller which was handed to us before easter and start with the "hands on" work. A big takeaway was that an Arduino and a Raspberry PI have pretty different capabilites and the raspi is more like a smaller computer with lots of possibilites. Also Prof. Jubeh showed us a balancing two-wheeled roboter and let us control it with a joystick which was very cool. Afterwards he explained the sensors and actuators of the robot in detail.  

**What was good vs. difficult**
It was difficult to set up the Arduino IDE on my Ubuntu VM on my MacOS system. So I decided to just install the IDE on my native Mac system which worked perfectly. Then I wired the Arduino to my laptop and tried different example sketches like the built in blinking, relay LED and button touch LED. The latter button touch LED sketch didn't work at the beginning, precisely it didnt react to touching the buttons at all. After further research, I found out that the serial monitor settings were set on 9600, which might be not sensitive enough for the buttons. So I set it to 115200 and then it worked perfectly.

**Interactions & Performance**
We split up the exercises within in the group, while Michael Amann and me were responsible for task 2. The other team members worked on the other tasks, communication was solid.