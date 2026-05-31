## Documentation: Task B3 - MQTT Simulator
        
### Component Setup
This project sets up three decoupled IoT components communicating via an MQTT broker (`192.168.12.1:1883`):
1. Temperature Simulator: Periodically publishes simulated ambient values to `building/room/temperature`. The value smoothly rises and falls over time to mock environment fluctuations.
2. Heater Simulator: Subscribes to the control topic `building/room/heater/set`. It acts as the physical hardware, printing `"Heater status: ON"` or `"OFF"` to the console every second based on commands.
3. Integrator (Controller): Links the system together. It reads the temperature values, checks them against predefined limits, and sends the required `on` or `off` control triggers.

### Workflow & Verification
* Cold Condition (<= 19°C): The Integrator detects low temperature -> publishes `on` to `/set` -> Heater logs `ON`.
* Hot Condition (> 25°C): The Integrator detects high temperature -> publishes `off` to `/set` -> Heater logs `OFF`.