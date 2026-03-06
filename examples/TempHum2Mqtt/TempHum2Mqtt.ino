/*
  TempHum2Mqtt

  Reads temperature and humidity from the onboard sensor of the Arduino MKR IoT Carrier,
  publishes the values via MQTT once per second, and displays connection status and
  sensor readings on the carrier's LCD screen.

  Required hardware:
    - Arduino MKR WiFi 1010
    - Arduino MKR IoT Carrier

  WiFi credentials go in arduino_secrets.h
  MQTT configuration is in iot_system.h
*/

#include <Arduino_MKRIoTCarrier.h>
MKRIoTCarrier carrier;

#include <ArduinoMqttClient.h>
#if defined(ARDUINO_SAMD_MKRWIFI1010) || defined(ARDUINO_SAMD_NANO_33_IOT) || defined(ARDUINO_AVR_UNO_WIFI_REV2)
  #include <WiFiNINA.h>
#elif defined(ARDUINO_SAMD_MKR1000)
  #include <WiFi101.h>
#elif defined(ARDUINO_ARCH_ESP8266)
  #include <ESP8266WiFi.h>
#elif defined(ARDUINO_PORTENTA_H7_M7) || defined(ARDUINO_NICLA_VISION) || defined(ARDUINO_ARCH_ESP32) || defined(ARDUINO_GIGA) || defined(ARDUINO_OPTA)
  #include <WiFi.h>
#elif defined(ARDUINO_PORTENTA_C33)
  #include <WiFiC3.h>
#elif defined(ARDUINO_UNOR4_WIFI)
  #include <WiFiS3.h>
#endif

#include "arduino_secrets.h"
#include "iot_system.h"
///////please enter your sensitive data in the Secret tab/arduino_secrets.h
char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;

WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);

const char broker[] = MQTT_HOST;
int        port     = 1883;
const char topic[]  = MQTT_TOPIC;

const long interval = 1000;
unsigned long previousMillis = 0;

int lcdLine = 0; // for wrapping
const int LCD_LINE_HEIGHT = 20;
const int LCD_TEXT_SIZE   = 2;

void lcdClear() {
  carrier.display.fillScreen(ST77XX_BLACK);
  carrier.display.setTextColor(ST77XX_WHITE);
  carrier.display.setTextSize(LCD_TEXT_SIZE);
  lcdLine = 0;
}

void lcdPrintln(const String &msg) {
  int y = lcdLine * LCD_LINE_HEIGHT;
  if (y + LCD_LINE_HEIGHT > 240) {
    lcdClear(); // wrap back to top when screen is full
  }
  carrier.display.setCursor(0, lcdLine * LCD_LINE_HEIGHT);
  carrier.display.println(msg);
  lcdLine++;
  Serial.println(msg); // mirror to serial
}
// --------------------------

void setup() {
  Serial.begin(115200);
  delay(1000); // let the wifi module settle...
  while (!Serial) { ; }  // wait for USB serial - remove for standalone operation!

  carrier.noCase();
  carrier.begin();

  lcdClear();

  // attempt to connect to WiFi network:
  lcdPrintln("WiFi: " + String(ssid));
  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    // avoid SPI display calls here — display and WiFiNINA share the SPI bus
    Serial.print(".");
    delay(5000);
  }
  lcdPrintln("WiFi connected");

  // attempt to connect to MQTT broker:
  lcdPrintln("MQTT: " + String(broker));

  if (!mqttClient.connect(broker, port)) {
    lcdPrintln("MQTT FAILED!");
    lcdPrintln("Err: " + String(mqttClient.connectError()));
    while (1);
  }

  lcdPrintln("MQTT connected");
}

void loop() {
  mqttClient.poll(); // allow heartbeat / connection even though we're not receiving!
  
  if (millis() - previousMillis >= interval) {
    previousMillis = millis(); // save the last time a message was sent

    float temperature = carrier.Env.readTemperature();
    float humidity    = carrier.Env.readHumidity();

    lcdPrintln("T=" + String(temperature, 1) + "C H=" + String(humidity, 1) + "%");

    // send message as small JSON snippet:
    mqttClient.beginMessage(topic);
    mqttClient.print("{ temp=");
    mqttClient.print(temperature);
    mqttClient.print(", hum=");
    mqttClient.print(humidity);
    mqttClient.print(" }");
    mqttClient.endMessage();

  }
}
