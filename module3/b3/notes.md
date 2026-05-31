## Documentation: Task B3 - MQTT Simulator
        
### Component Setup
This project sets up three decoupled IoT components communicating via an MQTT broker (`192.168.12.1:1883`):
1. Temperature Simulator: Periodically publishes simulated ambient values to `building/room/temperature`. The value smoothly rises and falls over time to mock environment fluctuations.
    
    As exercises 1 and 3 were very similar. We used this part of the exercise from Task B1. The script that generates temperature-values and publishes them can be found [here](../b1/code/jupyterNotebooks/b1_b3_publish_Temp_data.ipynb).
2. Heater Simulator: Subscribes to the control topic `building/room/heater/set`. It acts as the physical hardware, printing `"Heater status: ON"` or `"OFF"` to the console every second based on commands.
    
    For this component, we created a simple SUB-Script, that subscribes to a topic and prints out the values. This script can be seen [here](../b1/code/jupyterNotebooks/simple_aircon_sub.ipynb).
3. Integrator (Controller): Links the system together. It reads the temperature values, checks them against predefined limits, and sends the required `on` or `off` control triggers.
    
    This integrator was implemented in two versions. One was implemented with Node-RED as part of exercise 5, but for this task, we used a simple python script, which can be seen [here](./b3_simulator_client.py).

### Workflow & Verification
* Cold Condition (<= 19°C): The Integrator detects low temperature -> publishes `on` to `/set` -> Heater logs `ON`.
* Hot Condition (> 25°C): The Integrator detects high temperature -> publishes `off` to `/set` -> Heater logs `OFF`.