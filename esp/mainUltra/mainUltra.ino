//Carrega a biblioteca do sensor ultrassonico
#include <Ultrasonic.h> 
//#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <ESP8266WiFi.h>        // Include the Wi-Fi library



#define ID_MQTT   "Fisio/ID_101010D3"
#define TOPICO_SUBSCRIBE_LIGA "Fisio/LigaD3"
#define TOPICO_PUBLISH_TEMPO   "Fisio/TempoD3"

#define TOPICO_SUBSCRIBE_TEMPO_MAX "Fisio/TempoMax"
#define TOPICO_SUBSCRIBE_DIST_MIN "Fisio/DistMin"


int tempoMaximo = 3000;
int distMinima = 10;

// Add your MQTT Broker IP address, example:
const char* mqtt_server = "test.mosquitto.org";   //COLOCA AQUI O ENDEREÇO DO BROKER
const char* mqttUsername = "emossin";
const char* mqttPassword = "ifsp1234";

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

int flagLigado = 0;
int timeLiga = 0;

//variável responsável por armazenar a distância lida pelo sensor ultrassônico
unsigned int distancia = 0;

// Replace the next variables with your SSID/Password combination
const char* ssid = "DomMaya";        //COLOCA AQUI A INFORMAÇÔES DA REDE WIFI
//const char* ssid = "IFSP-SRT";        //IF WIFI
const char* password = "beatles12";


//conexão dos pinos para o sensor ultrasonico
#define PIN_TRIGGER D4
#define PIN_ECHO D5
#define PIN2 D2

//Inicializa o sensor nos pinos definidos acima
Ultrasonic ultrasonic(PIN_TRIGGER, PIN_ECHO);

void setup_wifi() {
  delay(5000);
  // We start by connecting to a WiFi network
  Serial.println("Setup Wifi.....");
  //WiFi.disconnect();
  Serial.println();
  Serial.print("Connecting to ");
  //Serial.println(ssid);
  WiFi.begin(ssid, password);
  WiFi.begin(ssid);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.print("topic: ");
  Serial.println(topic);

  // Feel free to add more if statements to control more GPIOs with MQTT
  // Changes the output state according to the message
  if (String(topic) == TOPICO_SUBSCRIBE_LIGA) {
    if(messageTemp == "LIGA"){
      flagLigado = 1;
      Serial.println("LIGA");
      timeLiga = millis();
    }
  }

  if (String(topic) == TOPICO_SUBSCRIBE_TEMPO_MAX) {
      Serial.print("messageTemp: ");
      Serial.println(messageTemp);
      tempoMaximo = messageTemp.toInt()*1000;
      Serial.print("tempoMaximo: ");
      Serial.println(tempoMaximo);
  }

  if (String(topic) == TOPICO_SUBSCRIBE_DIST_MIN) {
      Serial.print("messageTemp: ");
      Serial.println(messageTemp);
      distMinima = messageTemp.toInt();
      Serial.print("distMinima: ");
      Serial.println(distMinima);
  }
  
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(ID_MQTT)) {
      Serial.println("connected");
      // Subscribe
      client.subscribe(TOPICO_SUBSCRIBE_LIGA);
      client.subscribe(TOPICO_SUBSCRIBE_TEMPO_MAX);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
/*
  FAZ A LEITURA DA DISTANCIA ATUAL CALCULADA PELO SENSOR
*/
int getDistance()
{
    int distanciaCM;
    long microsec = ultrasonic.timing();
    distanciaCM = ultrasonic.convert(microsec, Ultrasonic::CM);
    //Serial.println(distanciaCM);
    return distanciaCM;
}

long verificarDistancia()
{
    distancia = getDistance();

    return distancia;
}

void setup() {
  Serial.begin(9600);
  Serial.println("Serial...");
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  //pinMode(D1,OUTPUT);
  pinMode(PIN2,OUTPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(PIN2, LOW);  // Apaga o LED

}


void mqttSendTempo(){
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  long tempo = (millis()-timeLiga);
  char tempoString[8];
  dtostrf(tempo, 1, 2, tempoString);
  client.publish(TOPICO_PUBLISH_TEMPO,tempoString);
  long now = millis();
}

void loop() {

    if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long d = verificarDistancia();  
  //flagLigado = 1;
  if (flagLigado == 1){
    long tempo = (millis()-timeLiga);
    if(tempo>tempoMaximo || d<distMinima){
        Serial.print("d menor que 10: ");   
        Serial.println(d);
      digitalWrite(PIN2, LOW);  
            flagLigado = 0;
      mqttSendTempo();
      //Serial.print("maior");  // turn the LED on (HIGH is the voltage level)
    }else{
        Serial.print("d maior que 10: ");   
        Serial.println(d);

      digitalWrite(PIN2, HIGH);    // turn the LED off by making the voltage LOW
      //Serial.print("menor"); 

    }
  }
  

}


