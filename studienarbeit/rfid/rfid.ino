#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN D8
#define RST_PIN D3

const char* ssid = "iotempire-827dd9";
const char* password = "internetofthings";
const char* mqtt_server = "192.168.12.1";

WiFiClient espClient;
PubSubClient client(espClient);
MFRC522 rfid(SS_PIN, RST_PIN);

void reconnect() {
  while (!client.connected()) {
    if (client.connect("esp8266-rfid-reader")) {
      Serial.println("MQTT connected");
    } else {
      delay(1000);
    }
  }
}

String uidToString() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");

  client.setServer(mqtt_server, 1883);

  SPI.begin();
  rfid.PCD_Init();

  Serial.println("RFID reader ready");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uid = uidToString();

  String payload = "{\"rfid_uid\":\"" + uid + "\",\"source\":\"admin-rfid-reader\"}";
  client.publish("smartparking/rfid/scan", payload.c_str());

  Serial.println("Published UID: " + uid);

  rfid.PICC_HaltA();
  delay(1000);
}