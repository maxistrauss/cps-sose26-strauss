Yes, it is possible to run an HTTP server on the Arduino MKR WiFi 1010.

The MKR WiFi 1010 has built-in WiFi via the u-blox NINA-W102 module. Instead of the ESP8266-specific libraries, the Arduino MKR WiFi 1010 uses the WiFiNINA library:

`#include <WiFiNINA.h>`

With WiFiNINA, the board can connect to a WiFi network using `WiFi.begin(ssid, password)` and start a simple HTTP server using:

`WiFiServer server(80);`

A laptop or other device in the same network can then access the microcontroller through its local IP address in a browser. Incoming HTTP requests are handled with `WiFiClient`, and the Arduino can send back HTTP responses or trigger actions such as switching LEDs or motors.

So, the same general concept as on the ESP8266 is possible, but the implementation uses `WiFiNINA`, `WiFiServer`, and `WiFiClient` instead of `ESP8266WiFi` and `ESP8266WebServer`.