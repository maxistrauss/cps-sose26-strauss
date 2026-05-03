## Exercise B4

### A)

#### Documentation

As part of Exercise B3, we already had the ESP8266 as a webserver in our target WLAN. 

This ESP already implemented the GET endpoints /on and /off. So for this task, instead of sending those requests with a laptop, we added another microcontroller to the network, which sends out the desired requests. 

As we had a shortage of USB-C Cables during this exercise, we used the Arduino MKR1010 from the previous exercises to act as the http client. 

To send out the /on and /off requests, we used this [code](./http_client/sketch_may2a.ino). 

We first had to reset the ESP8266, so that the IP-address of the http-server could be identified (we printed out the ip-address to the serial monitor). 

After identifying the ip address, we had to insert it at the top of the provided code: 

```
IPAddress server(172, 16, 29, 230); // ESP8266 IP
```

After that, the code sends out http requests alternating between /on and /off with a 2 seconds delay. 

### B)

During this step, we had to adjust both the http server as well as the http client code. 

For the http server, we created a boolean variable that tracks the state. In addition to that, we created a new endpoint called /toggle, which makes the state alternate between true and false. 

The code for the http server can be found [here](./http_server/sketch_may2a.ino). 

As for the http client, we only needed to change the path so that a http request is sent to that particular route. 

We also changed the client code, so that the request is sent when a particular touchpad of the MKR IoT Carrier is pressed. 

The client code can be found [here](./http_client_triggered/sketch_may2b.ino).

The most notable change for the http client is changing the route of the endpoint:

```
sendRequest("/toggle");
```

A demo for this part of the exercise can be found [here](./screenshots/ex4.mp4).


### C Scalability Analysis

Yes, it does support multiple clients, but the state that is stored on the server is not thread save as it is implemented currenlty. So there might be unexpected behaviour, when there are multiple clients changing the state at the same time. 

---

It is problematic, because requests at the same time negate each other. This could lead to unwanted behaviour. An example is shown in the following sequence: 

```
Client A sends /toggle -> LED turns ON

Clients B,C want to turn off the LED

Client B sends /toggle -> LED turns OFF

At the same time: Client C sends /toggle -> LED turns back ON
```


--- 

For our improved system, we would redesign it so that the server Wemos is the single source of truth for the LED state. The clients should not store or guess the current LED state locally, because with multiple clients this can easily become inconsistent.

Instead of mainly relying on a /toggle endpoint, the server should provide clear state-changing routes such as:

```
/on      -> switch LED on
/off     -> switch LED off
/status  -> return current LED state
```

The /on and /off endpoints are safer than /toggle, because they always lead to a clearly defined result. Sending /on multiple times will always leave the LED on, and /off will always leave it off.

A /toggle endpoint is problematic with multiple clients because the final result depends on the exact order of incoming requests. For example:

The /status endpoint is still useful, because every client can ask the server for the real current LED state before displaying information or deciding what to do. However, /status alone does not solve race conditions. The important part is that the server manages the state centrally and updates the LED in one controlled place.

So the reliable design is: clients send requests, but the server owns the LED state and decides the final state.



