# Installing Iotempower on local machine

Installing IoTempower on our local machine was very straight forward especially with Linux. I just run the following commands on my debian 12 machine. 

```sh
cd # go to home directory
my_iot_folder=iot
git clone https://github.com/iotempire/iotempower "$my_iot_folder"
cd "$my_iot_folder"
bash run
```

After that I had two new folders in my home-directory: iot and iot-systems.

Within iot-systems, I am now able to run the shell-command

```sh
iot
```

to start the iotempower-shell.

Unfortunatly, with installing Iotempower, some local settings were overwritten. This mostly affected me with my local installion of Node-RED as the settings.js-file was overwritten with different configs.

Therefore, I had to adjust settings.js for Node-RED to work normally again.