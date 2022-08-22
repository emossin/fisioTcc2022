const mqtt = require('mqtt')
const relatorioHandler =  require("./relatorioHandler.js")




const maxRandom = 4



var ligaD1 = "Fisio/LigaD1"
var ligaD2 = "Fisio/LigaD2"
var ligaD3 = "Fisio/LigaD3"
var ligaD4 = "Fisio/LigaD4"
var tempoD1 = "Fisio/TempoD1"
var tempoD2 = "Fisio/TempoD2"
var tempoD3 = "Fisio/TempoD3"
var tempoD4 = "Fisio/TempoD4"
var tempoMax = "Fisio/TempoMax"
//************************************************/
//SUBSCRIBE TODAS AS SALAS CADASTRADAS PARA TESTE
//************************************************/
var options = {
    port: 1883,
    host: 'test.mosquitto.org',
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    //username: 'user1',
    //password: 'xuxax',
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};


client = mqtt.connect(options);

module.exports.client

module.exports.subscribeAll = function() {
    client.subscribe(ligaD1);
    client.subscribe(ligaD2);
    client.subscribe(ligaD3);
    client.subscribe(ligaD4);
    client.subscribe(tempoMax);
    client.subscribe(tempoD1);
    client.subscribe(tempoD2);
    client.subscribe(tempoD3);
    client.subscribe(tempoD4);
};

this.subscribeAll();



module.exports.publishLigaRandom = function(tempoMax,distMin) {
    //fazer o handle aqui
    dispositivo = Math.floor(Math.random() * (maxRandom - 1 + 1) + 1)
    console.log("RANDOM: " + dispositivo)
    //dispositivo = 1
    topico = ""
    if(dispositivo == 1){
        topico = ligaD1
    }else if(dispositivo == 2){
        topico = ligaD2
    }else if(dispositivo == 3){
        topico = ligaD3
    }else if(dispositivo == 4){
        topico = ligaD4
    }
    console.log("SENDING publish TOPICO: " + topico)
    client.publish("Fisio/TempoMax", tempoMax)
    client.publish("Fisio/DistMin", distMin)
    client.publish(topico, "LIGA")
};

//initialize the MQTT client
module.exports.start = function(options) {
    //client = mqtt.connect(options);
    
    client.on('connect', function () {
        console.log('Connected');
        
    });
    client.on('error', function (error) {
        console.log(error);
    });
    client.on('message', function (topic, message) {
        if(runnigFlag == 1){
        flagMsgTempo = 0;

        console.log('topic: ' + topic);
        console.log('message: ' + message);
        console.log('arrayCount: ' + arrayCount);
        
        if(topic == tempoD1){
            flagMsgTempo = 1;
            console.log(message);
        }
        if(topic == tempoD2){
            flagMsgTempo = 1;
            console.log(message);
        }
        if(topic == tempoD3){
            flagMsgTempo = 1;
            console.log(message);
        }
        if(topic == tempoD4){
            flagMsgTempo = 1;
            console.log(message);
        }



        if(flagMsgTempo == 1){
            relatorioHandler.addNovoTempo(message)
            dispositivo = Math.floor(Math.random() * (maxRandom - 1 + 1) + 1)
            console.log("RANDOM: " + dispositivo)
            //dispositivo = 1
            topico = ""
            if(dispositivo == 1){
                topico = ligaD1
            }else if(dispositivo == 2){
                topico = ligaD2
            }else if(dispositivo == 3){
                topico = ligaD3
            }else if(dispositivo == 4){
                topico = ligaD4
            }
            console.log("SENDING publish TOPICO: " + topico)
            client.publish(topico, "LIGA")
            flagMsgTempo = 0;
        }
    }

    });

};


this.start(options)



