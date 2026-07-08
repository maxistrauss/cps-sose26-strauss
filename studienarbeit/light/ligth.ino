#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoMqttClient.h>
#include <Adafruit_NeoPixel.h>

// WLAN
const char* WIFI_SSID = "GL-MT300N-V2-4c4";
const char* WIFI_PASS = "goodlife";

// MQTT
const char* MQTT_BROKER = "192.168.8.110";
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "building/light/status";

// Pins
const byte SENSOR_1_PIN = A2;
const byte SENSOR_2_PIN = A3;
const byte LED_STRIP_PIN = A4;

// LEDs
const int ANZAHL_LEDS = 30;
const byte HELLIGKEIT = 50;

// 5 Sekunden an
const unsigned long EINSCHALTDAUER = 10000;

// MQTT QoS
const int MQTT_QOS = 2;

Adafruit_NeoPixel ledLeiste(
  ANZAHL_LEDS,
  LED_STRIP_PIN,
  NEO_GRB + NEO_KHZ800
);

WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);

unsigned long letzteBewegungSensor1 = 0;
unsigned long letzteBewegungSensor2 = 0;

bool sensor1An = false;
bool sensor2An = false;

unsigned long letzterWlanVersuch = 0;
unsigned long letzterMqttVersuch = 0;

void setup() {
  pinMode(SENSOR_1_PIN, INPUT);
  pinMode(SENSOR_2_PIN, INPUT);

  Serial.begin(9600);
  delay(2000);

  ledLeiste.begin();
  ledLeiste.clear();
  ledLeiste.setBrightness(HELLIGKEIT);
  ledLeiste.show();

  Serial.println("Start MKR WiFi 1010 mit QoS 2");
}

void loop() {
  wlanUndMqttPruefen();

  bool bewegung1 = digitalRead(SENSOR_1_PIN) == HIGH;
  bool bewegung2 = digitalRead(SENSOR_2_PIN) == HIGH;

  // Sensor 1 -> Floor 1 -> LEDs 1 bis 15 weiß
  if (bewegung1) {
    letzteBewegungSensor1 = millis();

    if (!sensor1An) {
      sensor1An = true;

      setzeBereich(0, 14, 255, 255, 255);
      sendeStatus(1, "on");

      Serial.println("Sensor 1 AN");
    }
  }

  // Sensor 2 -> Floor 2 -> LEDs 16 bis 30 weiß
  if (bewegung2) {
    letzteBewegungSensor2 = millis();

    if (!sensor2An) {
      sensor2An = true;

      setzeBereich(15, 29, 255, 255, 255);
      sendeStatus(2, "on");

      Serial.println("Sensor 2 AN");
    }
  }

  // Sensor 1 nach 5 Sekunden ohne Bewegung aus
  if (sensor1An && millis() - letzteBewegungSensor1 >= EINSCHALTDAUER) {
    sensor1An = false;

    setzeBereich(0, 14, 0, 0, 0);
    sendeStatus(1, "off");

    Serial.println("Sensor 1 AUS");
  }

  // Sensor 2 nach 5 Sekunden ohne Bewegung aus
  if (sensor2An && millis() - letzteBewegungSensor2 >= EINSCHALTDAUER) {
    sensor2An = false;

    setzeBereich(15, 29, 0, 0, 0);
    sendeStatus(2, "off");

    Serial.println("Sensor 2 AUS");
  }

  mqttClient.poll();

  delay(50);
}

void wlanUndMqttPruefen() {
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - letzterWlanVersuch > 5000) {
      letzterWlanVersuch = millis();

      Serial.println("WLAN verbinden...");
      WiFi.begin(WIFI_SSID, WIFI_PASS);
    }

    return;
  }

  if (!mqttClient.connected()) {
    if (millis() - letzterMqttVersuch > 5000) {
      letzterMqttVersuch = millis();

      Serial.println("MQTT verbinden...");

      if (mqttClient.connect(MQTT_BROKER, MQTT_PORT)) {
        Serial.println("MQTT verbunden");
      } else {
        Serial.print("MQTT Fehler: ");
        Serial.println(mqttClient.connectError());
      }
    }

    return;
  }

  mqttClient.poll();
}

void sendeStatus(int floor, const char* status) {
  if (!mqttClient.connected()) {
    Serial.println("MQTT nicht verbunden, Nachricht nicht gesendet");
    return;
  }

  char nachricht[60];

  snprintf(
    nachricht,
    sizeof(nachricht),
    "{\"floor\":%d,\"status\":\"%s\"}",
    floor,
    status
  );

  bool retained = false;

  mqttClient.beginMessage(MQTT_TOPIC, retained, MQTT_QOS);
  mqttClient.print(nachricht);
  mqttClient.endMessage();

  Serial.print("MQTT QoS 2 gesendet: ");
  Serial.println(nachricht);
}

void setzeBereich(int ersteLED, int letzteLED, byte r, byte g, byte b) {
  for (int i = ersteLED; i <= letzteLED; i++) {
    ledLeiste.setPixelColor(i, ledLeiste.Color(r, g, b));
  }

  ledLeiste.show();
}