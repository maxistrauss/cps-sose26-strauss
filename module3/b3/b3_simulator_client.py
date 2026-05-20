import marimo

__generated_with = "0.23.5"
app = marimo.App(width="medium")


@app.cell
def _():
    import time
    import math
    import paho.mqtt.client as mqtt

    # MQTT broker
    BROKER = "192.168.12.1"   # wenn Mosquitto auf deinem eigenen Rechner/WSL läuft
    PORT = 1883

    # MQTT topic
    TOPIC = "building/room/temperature"
    TOPCI2 = "building/room/aircon_state"

    #global State_heating
    #global State_cooling


    client = mqtt.Client()
    return BROKER, PORT, TOPIC, client


@app.cell
def _(TOPIC, TOPIC2):
    State_heating = False
    State_cooling = False


    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Verbunden mit MQTT Broker")
            client.subscribe(TOPIC)
            print(f"Abonniert: {TOPIC}")
        else:
            print("Verbindung fehlgeschlagen, Code:", rc)

    def on_message(client, userdata, msg):
        payload = msg.payload.decode()
        print(payload);
        if float(payload) <= 19 and State_heating == False:
            client.publish(TOPIC2, "on")
        elif float(payload) > 25 and State_cooling == False:
            client.publish(TOPIC2, "off")





    return on_connect, on_message


@app.cell
def _(BROKER, PORT, client, on_connect, on_message):
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(BROKER, PORT, 60)

    client.loop_forever()
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
