#define BUTTON_PIN D3
#define LED_PIN LED_BUILTIN

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    digitalWrite(LED_PIN, LOW);   
  } else {
    digitalWrite(LED_PIN, HIGH);  
  }
}