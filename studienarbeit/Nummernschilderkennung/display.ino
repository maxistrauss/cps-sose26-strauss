#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Fonts/Picopixel.h>

// Exakt für OLED Shield V2.0.0 (64x48 Pixel)
#define SCREEN_WIDTH  64
#define SCREEN_HEIGHT 48
#define OLED_RESET    -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(9600);
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    for(;;); 
  }
  
  display.ssd1306_command(SSD1306_DISPLAYON); 
  display.clearDisplay();
  
  // Grundeinstellungen
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setTextWrap(true);
  display.setFont(&Picopixel);
  
  // Start-Text knallhart oben links ansetzen
  display.setCursor(0, 4);
  display.println("BEREIT");
  display.display();
}

void loop() {
  if (Serial.available() > 0) {
    // Lies den Text vom Pi bis zum Zeilenumbruch
    String input = Serial.readStringUntil('\n');
    input.trim();
    
    if (input.length() > 0) {
      display.clearDisplay();
      
      display.setCursor(0, 4);
      
      // Kennzeichen rausschreiben
      display.println(input);
      display.display();
    }
  }
}