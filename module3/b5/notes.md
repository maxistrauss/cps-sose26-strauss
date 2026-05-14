## B5: MQTT with Node-RED

**Step 1:** Installing Node-Red on local machine: 

```
bash <(curl -sL https://github.com/node-red/linux-installers/releases/latest/download/update-nodejs-and-nodered-deb)
```

**Step 2:** Open Node-red

**Step 3:** Create MQTT-Node like [this](./screenshots/b5_mqtt_node_config.png)

**Step 4:** Add MQTT-in

**Step 5:** Test Temperature subscription like [this](./screenshots/b5_testing_setup_with_debug.png)

**Step 6:** Create final design and receive results like [this](./screenshots/b5_design_with_results.png)

**Step 7:** Check the functionality with demo. For this I created a simple sub-script that reads the AC-Topic. This can be seen [here](./screenshots/b5_AC_sub_demo.png)

### About the flow

First, the flow subscribes to the temperature-topic where all the temperature-data is published. Then the data is converted to float so that it can be compared in the following Switch-widget. After that we use a switch widget that checks the temperature data. This switch-node includes two statements: 

- if temperature < 20 -> Output 1
- if temperature > 25 -> Output 2

After this step, we change the temperature values to either "on" or "off". The last step is to publish the data to the MQTT topic of the AC. We also added debug nodes to see the results.