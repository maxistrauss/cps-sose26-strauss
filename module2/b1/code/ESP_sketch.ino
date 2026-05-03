#include "thingProperties.h"

#define BUTTON_PIN D3   // D3 = GPIO0 on ESP8266 / D1 mini

bool lastButtonState = HIGH;
bool handledPress = false;
unsigned long lastDebounce = 0;
const unsigned long debounceDelay = 50;

void setup() {
  Serial.begin(9600);
  delay(1500);

  pinMode(BUTTON_PIN, INPUT_PULLUP);

  initProperties();

  ArduinoCloud.begin(ArduinoIoTPreferredConnection);

  setDebugMessageLevel(2);
  ArduinoCloud.printDebugInfo();
}

void loop() {
  ArduinoCloud.update();

  bool reading = digitalRead(BUTTON_PIN);

  if (reading != lastButtonState) {
    lastDebounce = millis();
  }

  if ((millis() - lastDebounce) > debounceDelay) {
    if (reading == LOW && !handledPress) {
      button_press = true;

      Serial.print("button_press toggled to: ");
      Serial.println(button_press ? "true" : "false");

      handledPress = true;
    }

    if (reading == HIGH) {
      handledPress = false;
    }
  }

  lastButtonState = reading;
}

void onButtonPressChange() {
  Serial.print("button_press changed from Cloud to: ");
  Serial.println(button_press ? "true" : "false");
}