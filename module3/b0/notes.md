### B Getting started with the IoTempower Gateway

For the preparation phase of this exercise, we performed the following steps:

- Plug in the Raspberry Pi
- Plug in the small display
- Plug in the wifi dongle -> This created a new Wifi Access Point
- connect to newly created wifi of the gateway
- connect to gateway using ssh:

```
ssh iot@192.168.12.1
```

- password: iotempire
- iot upgrade in the console
- open iotempire webpage in browser with: https://192.168.12.1/


#### Which connectors does the Raspi have? What’s the purpose?

- Ethernet
- Micro-HDMI
- USB
- USB-C
- GPIO Pins

#### How can you find the raspberry Pi on the network or do the initial connection?

At the beginning, we connected to the Wifi, that was created by the Raspberry Pi. Then you can run the following command to find the IP-Adress of the Gateway:

```
sudo arp -a
```

#### Connecting the gateway to wifi

To connect the Raspberry Pi to the Wifi, we located the file /boot/wifi-in.txt.

In this file, we placed the SSID and the Password of the Wifi Access Point we want to connect to (in our case: TI Roboter). 

Then we rebooted the Raspberry Pi using: 

```
sudo reboot
```

After rebooting, we were able to connect to the Raspberry Pi and ping an outside DNS Server: 

```
ping 8.8.8.8
```



