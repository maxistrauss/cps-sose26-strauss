#include <ESP8266WiFi.h>
#include <MQTT.h>

const char ssid[] = "iotempire-827dd9";
const char pass[] = "internetofthings";

const char mqttHost[] = "192.168.12.1"; // broker IP

WiFiClient net;
MQTTClient client;

#define echoPin D1   // D6
#define trigPin D2   // D7

#define MAX_DISTANCE 220
#define TIMEOUT (MAX_DISTANCE * 60UL)

// functions

void connect() {
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("\nWiFi connected");

  Serial.print("Connecting to MQTT");

  while (!client.connect("esp8266-ultrasonic")) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nMQTT connected");
}

float getSonar() {
  //sending trigger pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);


  // waiting for echo
  unsigned long pingTime = pulseIn(echoPin, HIGH, TIMEOUT);

  if (pingTime <= 0) {
    return -1;
  }

  float distance = pingTime * 0.0343 / 2.0;

  return distance;
}

float median5(float values[5]) {
  // Copy so we don't modify the original array
  float sorted[5];

  for (int i = 0; i < 5; i++) {
    sorted[i] = values[i];
  }

  // Bubble sort
  for (int i = 0; i < 4; i++) {
    for (int j = i + 1; j < 5; j++) {
      if (sorted[j] < sorted[i]) {
        float temp = sorted[i];
        sorted[i] = sorted[j];
        sorted[j] = temp;
      }
    }
  }

  // Middle element
  return sorted[2];
}

float scan() {
  float sensorData[5];
  int validCount = 0;
  int attempts = 0;

  while (validCount < 5 && attempts < 15) {
    float value = getSonar();

    if (value > 0) {
      sensorData[validCount] = value;
      validCount++;
    }

    attempts++;
    delay(50);
  }

  if (validCount < 5) {
    Serial.println("Not enough valid sensor readings.");
    return -1;
  }

  return median5(sensorData);
}

void setup() {
  Serial.begin(9600);

  Serial.println("Starting HC-SR04 test...");
  Serial.println("ECHO = D1");
  Serial.println("TRIG = D2");

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  digitalWrite(trigPin, LOW);


  // connect to wifi and mqtt
  WiFi.begin(ssid, pass);

  client.begin(mqttHost, 1883, net);

  connect();

  Serial.println("Setup complete.");
}

void loop() {

  float value;
  float distance;

  distance = 100.0;

  value = scan();

  if (value > 0 && value < distance) {
    client.publish("sensors/ultrasonic/1", "true");
  } else if (value >= distance) {
    client.publish("sensors/ultrasonic/1", "false");
  }
  else {
    // if there were problems reading the data, dont publish anythings.
  }

  delay(1000);
}