#include <ESP8266WiFi.h>
#include <MQTT.h>

float OCCUPIED_THRESHOLD = 23.0;

const char ssid[] = "GL-MT300N-V2-4c4";
const char pass[] = "goodlife";

const char mqttHost[] = "192.168.8.110"; // broker IP

WiFiClient net;
MQTTClient client;

#define echoPin D1   // D6
#define trigPin D2   // D7

#define MAX_DISTANCE 220
#define TIMEOUT (MAX_DISTANCE * 60UL)

// functions

void messageReceived(String &topic, String &payload) {
  if (topic == "/sensors/ultrasonic/1/threshold/set") {
    float newThreshold = payload.toFloat();

    if (newThreshold > 0) {
      OCCUPIED_THRESHOLD = newThreshold;

      Serial.print("Occupied threshold changed to: ");
      Serial.println(OCCUPIED_THRESHOLD);
    }
    else {
      Serial.print("Invalid threshold received: ");
      Serial.println(payload);
    }
  }
}

void connect() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Connecting to WiFi");

    WiFi.disconnect();
    WiFi.begin(ssid, pass);

    while (WiFi.status() != WL_CONNECTED) {
      Serial.print(".");
      delay(500);
    }

    Serial.println("\nWiFi connected");
  }

  if (!client.connected()) {
    Serial.print("Connecting to MQTT");

    while (!client.connect("esp8266-ultrasonic")) {
      Serial.print(".");
      delay(1000);
    }

    Serial.println("\nMQTT connected");

    // Subscriptions must be restored after every MQTT reconnect
    client.subscribe("/sensors/ultrasonic/1/threshold/set");
    Serial.println("Subscribed to threshold topic");
  }
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
    delay(90);
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
  client.onMessage(messageReceived);

  connect();

  Serial.println("Setup complete.");
}

void loop() {

  //reconnect on disconnect
  if (WiFi.status() != WL_CONNECTED || !client.connected()) {
    connect();
  }

  client.loop();
  
  float value;

  value = scan();

  if (value > 0) {
    bool occupied = value < OCCUPIED_THRESHOLD;

    String payload = "{";
    payload += "\"occupied\":";
    payload += occupied ? "true" : "false";
    payload += ",\"distance\":";
    payload += String(value, 2);
    payload += "}";

    client.publish("sensors/ultrasonic/1", payload);
  }
  else {
    // if there were problems reading the data, don't publish anything.
  }

  delay(1000);
}