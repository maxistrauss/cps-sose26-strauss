#include <SPI.h>
#include <WiFiNINA.h>

#include <Arduino_MKRIoTCarrier.h>
MKRIoTCarrier carrier; //Constructor of the carrier maybe we can include it on the library itself



char ssid[] = "TI Roboter";
char pass[] = "ITRobot!";

IPAddress server(172, 16, 29, 230); // ESP8266 IP

void setup() {
  Serial.begin(115200);
  while (!Serial);

  //Init all the components from the board
  carrier.noCase();
  carrier.begin();

  Serial.println("Connecting WiFi...");

  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nWiFi connected");
  Serial.print("MKR IP: ");
  Serial.println(WiFi.localIP());

}

bool lastTouch3 = false;
unsigned long lastPressTime = 0;
const unsigned long debounceMs = 300;

void loop() {
  carrier.Buttons.update();

  bool touch3 = carrier.Buttons.getTouch(TOUCH3);

  if (touch3 && !lastTouch3 && millis() - lastPressTime > debounceMs) {
    lastPressTime = millis();

    Serial.println("Touching Button 3");

    carrier.leds.setPixelColor(3, 20, 20, 20);
    carrier.leds.show();

    sendRequest("/toggle");
  }

  if (!touch3) {
    carrier.leds.setPixelColor(3, 0);
    carrier.leds.show();
  }

  lastTouch3 = touch3;

  delay(20);
}

void sendRequest(const char* path) {
  WiFiClient client;

  Serial.print("Connecting to ESP8266 for ");
  Serial.println(path);

  if (!client.connect(server, 80)) {
    Serial.println("Connection FAILED");
    return;
  }

  Serial.print("Connected → sending ");
  Serial.println(path);

  client.print("GET ");
  client.print(path);
  client.println(" HTTP/1.1");
  client.println("Host: 192.168.178.42");
  client.println("Connection: close");
  client.println();

  unsigned long timeout = millis();

  while (millis() - timeout < 5000) {
    while (client.available()) {
      char c = client.read();
      Serial.write(c);
      timeout = millis();
    }

    if (!client.connected()) break;
  }

  client.stop();
  Serial.println("\nDone");
}