#include "thingProperties.h"
#include "Arduino_MKRIoTCarrier.h"
MKRIoTCarrier carrier;


String enteredPin = "";

bool lastTouch0 = false;
bool lastTouch1 = false;
bool lastTouch2 = false;
bool lastTouch3 = false;
bool lastTouch4 = false;

unsigned long lastPressTime = 0;
const unsigned long debounceMs = 300;

void setup() {
  Serial.begin(9600);
  delay(1500);

  CARRIER_CASE = false;
  carrier.begin();

  initProperties();
  ArduinoCloud.begin(ArduinoIoTPreferredConnection);

  setDebugMessageLevel(0);

  Serial.println("System ready");
}


void loop() {
  ArduinoCloud.update();
  carrier.Buttons.update();

  if (button_press == true) {
    checkPinButton(TOUCH1, lastTouch1, "1", 1);
    checkPinButton(TOUCH2, lastTouch2, "2", 2);
    checkPinButton(TOUCH3, lastTouch3, "3", 3);
    checkPinButton(TOUCH4, lastTouch4, "4", 4);

    bool touch0 = carrier.Buttons.getTouch(TOUCH0);
    

    if (touch0 && !lastTouch0 && millis() - lastPressTime > debounceMs) {
      lastPressTime = millis();

      Serial.print("Confirming PIN: ");
      Serial.println(enteredPin);

      carrier.leds.setPixelColor(0, 20, 20, 20);
      carrier.leds.show();

      if (enteredPin == pin_string) {
        Serial.println("PIN correct. Alarm disarmed.");
        button_press = false;
        carrier.leds.setPixelColor(0, 0);
        carrier.leds.show();
        carrier.display.fillScreen(0x07E0);
      } else {
        Serial.println("Wrong PIN. Alarm stays active.");
      }

      enteredPin = "";
    }

    if (!touch0) {
      carrier.leds.setPixelColor(0, 0);
      carrier.leds.show();
    }

    lastTouch0 = touch0;
  }

  delay(20);
}

void checkPinButton(touchButtons touchButton, bool &lastTouch, String digit, int ledIndex) {
  bool touched = carrier.Buttons.getTouch(touchButton);

  if (touched && !lastTouch && millis() - lastPressTime > debounceMs) {
    lastPressTime = millis();

    enteredPin += digit;

    Serial.print("Touching Button ");
    Serial.println(digit);

    Serial.print("Current PIN: ");
    Serial.println(enteredPin);

    carrier.leds.setPixelColor(ledIndex, 20, 20, 20);
    carrier.leds.show();
  }

  if (!touched) {
    carrier.leds.setPixelColor(ledIndex, 0);
    carrier.leds.show();
  }

  lastTouch = touched;
}

void onButtonPressChange() {
  
  if (button_press){
    carrier.display.fillScreen(0xF800);
  }
  else{
    carrier.display.fillScreen(0x07E0);
  }
}


/*
  Since PinString is READ_WRITE variable, onPinStringChange() is
  executed every time a new value is received from IoT Cloud.
*/
void onPinStringChange()  {
  // Add your code here to act upon PinString change
}
