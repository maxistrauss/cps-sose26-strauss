#include <SPI.h>
#include <WiFiNINA.h>

char ssid[] = "TI Roboter";
char pass[] = "ITRobot!";

IPAddress server(172, 16, 29, 230); // ESP8266 IP

void setup() {
  Serial.begin(115200);
  while (!Serial);

  Serial.println("Connecting WiFi...");

  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nWiFi connected");
  Serial.print("MKR IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // nothing for now
  sendRequest("/on");   // turn on
  delay(2000);          // wait 2 seconds
  sendRequest("/off");  // turn off
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
