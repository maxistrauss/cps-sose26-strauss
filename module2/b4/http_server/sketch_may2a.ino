#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

#ifndef STASSID
#define STASSID "TI Roboter"
#define STAPSK "ITRobot!"
#endif

const char* ssid = STASSID;
const char* password = STAPSK;

ESP8266WebServer server(80);

const int led = LED_BUILTIN;

// Beim ESP8266 ist LED_BUILTIN meistens active LOW:
// LOW  = LED an
// HIGH = LED aus
bool ledIsOn = false;

void setLed(bool on) {
  ledIsOn = on;

  if (ledIsOn) {
    digitalWrite(led, LOW);   // LED an
  } else {
    digitalWrite(led, HIGH);  // LED aus
  }
}

void handleRoot() {
  String message = "ESP8266 Webserver laeuft!\n\n";
  message += "Verfuegbare Endpunkte:\n";
  message += "/on      -> LED einschalten\n";
  message += "/off     -> LED ausschalten\n";
  message += "/toggle  -> LED umschalten\n\n";
  message += "Aktueller Status: ";
  message += ledIsOn ? "AN" : "AUS";
  message += "\n";

  server.send(200, "text/plain", message);
}

void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";

  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }

  server.send(404, "text/plain", message);
}

void setup(void) {
  pinMode(led, OUTPUT);

  // LED am Start ausschalten
  setLed(false);

  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.println("");
  Serial.print("Verbinde mit WLAN: ");
  Serial.println(ssid);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WLAN verbunden");
  Serial.print("IP-Adresse: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esp8266")) {
    Serial.println("MDNS responder gestartet");
    Serial.println("Aufruf auch moeglich mit: http://esp8266.local/");
  }

  server.on("/", handleRoot);

  server.on("/on", []() {
    setLed(true);
    server.send(200, "text/plain", "LED ist AN");
  });

  server.on("/off", []() {
    setLed(false);
    server.send(200, "text/plain", "LED ist AUS");
  });

  server.on("/toggle", []() {
    setLed(!ledIsOn);

    if (ledIsOn) {
      server.send(200, "text/plain", "LED wurde eingeschaltet");
    } else {
      server.send(200, "text/plain", "LED wurde ausgeschaltet");
    }
  });

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server gestartet");
  Serial.println("");
  Serial.println("Nutze diese Links:");
  Serial.print("http://");
  Serial.print(WiFi.localIP());
  Serial.println("/on");

  Serial.print("http://");
  Serial.print(WiFi.localIP());
  Serial.println("/off");

  Serial.print("http://");
  Serial.print(WiFi.localIP());
  Serial.println("/toggle");
}

void loop(void) {
  server.handleClient();
  MDNS.update();
}