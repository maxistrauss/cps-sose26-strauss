#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>

const char* ssid = "iotempire-827dd9";
const char* password = "internetofthings";
const char* mqtt_server = "192.168.12.1";

WiFiClient espClient;
PubSubClient client(espClient);
Servo barrierServo;

#define SERVO_PIN D2

void callback(char* topic, byte* payload, unsigned int length) {
  String msg = "";

  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  Serial.println(msg);

  if (msg.indexOf("\"OPEN\"") >= 0) {
    barrierServo.write(90);
    Serial.println("Barrier OPEN");
  }

  if (msg.indexOf("\"CLOSE\"") >= 0) {
    barrierServo.write(0);
    Serial.println("Barrier CLOSE");
  }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("esp8266-exit-servo")) {
      client.subscribe("smartparking/exit/barrier/cmd");
      Serial.println("MQTT connected and subscribed");
    } else {
      delay(1000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  barrierServo.attach(SERVO_PIN);
  barrierServo.write(0);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}