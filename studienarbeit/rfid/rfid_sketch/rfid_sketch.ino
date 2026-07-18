#include <ESP8266WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <MQTT.h>

const char* wifiSsid     = "GL-MT300N-V2-4c4";
const char* wifiPassword = "goodlife";

IPAddress mqttBroker(192, 168, 8, 110);

const uint16_t mqttPort = 1883;
const char* mqttTopic   = "ausfahren/rfid";

// --------------------------------------------------
// RFID-RC522 Verkabelung
//
// RC522       ESP8266
// --------------------
// 3.3V   ->   3.3V
// RST    ->   D0 
// GND    ->   GND
// MISO   ->   D6
// MOSI   ->   D7
// SCK    ->   D5
// SDA/SS ->   D8
// --------------------------------------------------
constexpr uint8_t RFID_RST_PIN = D0;
constexpr uint8_t RFID_SS_PIN  = D8;

WiFiClient wifiClient;
MQTTClient mqttClient(128);
MFRC522 rfidReader(RFID_SS_PIN, RFID_RST_PIN);

String lastUid = "";
unsigned long lastUidTime = 0;
const unsigned long duplicateBlockTime = 2000;

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.println();
  Serial.print("Verbinde mit WLAN: ");
  Serial.println(wifiSsid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSsid, wifiPassword);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WLAN verbunden.");
  Serial.print("IP-Adresse des ESP8266: ");
  Serial.println(WiFi.localIP());
}

void connectMqtt() {
  if (mqttClient.connected()) {
    return;
  }

  char clientId[32];

  snprintf(
    clientId,
    sizeof(clientId),
    "esp8266-rfid-%06X",
    ESP.getChipId()
  );

  Serial.print("Verbinde mit MQTT-Broker");

  while (!mqttClient.connect(clientId)) {
    Serial.print(".");
    delay(1000);

    if (WiFi.status() != WL_CONNECTED) {
      connectWifi();
    }
  }

  Serial.println();
  Serial.println("MQTT verbunden.");
}


String readUidAsString() {
  String uid = "";
  uid.reserve(rfidReader.uid.size * 2);

  for (byte i = 0; i < rfidReader.uid.size; i++) {
    byte value = rfidReader.uid.uidByte[i];

    if (value < 0x10) {
      uid += "0";
    }

    uid += String(value, HEX);
  }

  uid.toUpperCase();
  return uid;
}

void checkRfid() {

  if (!rfidReader.PICC_IsNewCardPresent()) {
    return;
  }

  if (!rfidReader.PICC_ReadCardSerial()) {
    return;
  }

  String uid = readUidAsString();
  unsigned long currentTime = millis();

  Serial.print("RFID erkannt: ");
  Serial.println(uid);

  bool duplicate =
    uid == lastUid &&
    currentTime - lastUidTime < duplicateBlockTime;

  if (!duplicate) {
    if (mqttClient.connected()) {
      bool published = mqttClient.publish(
        mqttTopic,
        uid,
        false,
        0
      );

      if (published) {
        Serial.print("Gesendet an MQTT-Topic ");
        Serial.print(mqttTopic);
        Serial.print(": ");
        Serial.println(uid);
      } else {
        Serial.println("Fehler beim MQTT-Versand.");
      }
    } else {
      Serial.println("Nicht gesendet: MQTT ist nicht verbunden.");
    }

    lastUid = uid;
    lastUidTime = currentTime;
  } else {
    Serial.println("Doppelte Erkennung ignoriert.");
  }

  rfidReader.PICC_HaltA();
  rfidReader.PCD_StopCrypto1();
}


void setup() {
  Serial.begin(115200);
  delay(100);

  Serial.println();
  Serial.println("ESP8266 RFID-MQTT-Reader startet...");

  SPI.begin();

  rfidReader.PCD_Init();
  delay(4);

  Serial.println("RC522 initialisiert.");
  rfidReader.PCD_DumpVersionToSerial();

  connectWifi();

  mqttClient.begin(mqttBroker, mqttPort, wifiClient);
  mqttClient.setKeepAlive(30);

  connectMqtt();

  Serial.println();
  Serial.println("Bereit. RFID-Karte an den Reader halten.");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
  }

  if (!mqttClient.connected()) {
    connectMqtt();
  }

  mqttClient.loop();

  delay(10);

  checkRfid();
}