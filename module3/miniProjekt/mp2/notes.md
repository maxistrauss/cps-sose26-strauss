## Mini-Project Prep (2/2): new and different actors

As we had some time-pressure, we mostly focused on finishing our mini-Project (Task MP3). Luckily, completing this project also meant doing the PREP-tasks that were required in this exercise. So even though we did not follow the steps in the tutorial step-by-step, we were able to use all hardware-components as well as IoTempower-commands. 

In the following section, we provide the code and the IoTempower-configurations to use the different types of hardware. 

**1.**

As we did not use any basic LEDs in our mini-Project, but we did use the Buzzer, which also uses the PWM command from IoTempower. How we used this command can be found in the next section.

**2.**

We did use the buzzer for our mini-Project and this component required the use of the PWM-command. We did not need to change the node.conf file, but we had to add the PWM-command to the [setup.cpp-file](../mp3/ressources/code/Buzzer/setup.cpp).

**3.**

For our mini-Project, we did use the servo motor to act as a lock in an access-control-system. We used the servo_switch-command for this particular task to correctly simulate a lock. The code can be seen [here](../mp3/ressources/code/SERVO/setup.cpp). We also did not need to change the node.conf file.  

**4.**

Lastly, we used the WS2812B RGB LED Shield. For this component, we used the command "rgb_strip_bus" with a length (of the LED Strip) of 1. The code for the component can be found [here](../mp3/ressources/code/LED/setup.cpp).