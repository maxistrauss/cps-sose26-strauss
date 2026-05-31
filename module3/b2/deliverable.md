Since the raspberry pi was non responsive sometimes when other team members where working with it via ssh, we decided to set up iotempower and mosquitto on my own system and do task B2 this way. So we kind of implemented the task of B7 here as well (:-) 
Publishing and subscribing to messages worked, but we struggled to trigger actions with this local setup.

Questions:

1. (Differences MQTT commands / regular CLI commands)
Regular CLI commands are executed on the local system, while MQTT commands in IoTempower are topic-based via publish/subscribe and can trigger actions on IoT devices connected through the gateway. So it is rather used for communication between  distributed components

2. (Does IoTEmpower help?)
Yes, IoTEmpower helps by providing a gateway that makes MQTT communication easier. It abstracts some of the setup and provides communication through common MQTT topics.

3. (mqtt_action)
It can be used to trigger actions on the IoTEmpower gateway via MQTT, including a payload. It is related to mqtt_send, which publishes messages, and mqtt_listen, which subscribes to topics and receives messages. But it rather triggers a specific action. It can be limited based on the correct payload format, topic structure... If not configured correctly it might send messages successfully but the intended action might not execute.