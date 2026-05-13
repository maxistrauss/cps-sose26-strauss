#include <Arduino_MKRIoTCarrier.h>
#include <WiFiNINA.h>
#include <ArduinoMqttClient.h>

char ssid[] = "iotempire-827dd9";
char pass[] = "internetofthings";

const char broker[] = "192.168.12.1";
const int port = 1883;
const char topic[] = "building/room/temperature";

MKRIoTCarrier carrier;
WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);

void setup() {
  Serial.begin(9600);
  while (!Serial);

  carrier.begin();

  Serial.print("Connecting to WiFi");
  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("\nWiFi connected");

  Serial.print("Connecting to MQTT");
  while (!mqttClient.connect(broker, port)) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("\nMQTT connected");
}

void loop() {
  mqttClient.poll();

  float temp = carrier.Env.readTemperature();

  mqttClient.beginMessage(topic);
  mqttClient.print(temp, 2);
  mqttClient.endMessage();

  Serial.print("Sent to ");
  Serial.print(topic);
  Serial.print(": ");
  Serial.println(temp, 2);

  delay(1000);
}