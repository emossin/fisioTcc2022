const express = require("express");
const app = express();
const { engine } = require ('express-handlebars');
const bodyParser = require('body-parser')
const path = require("path")
const mqtt = require('mqtt')
const mqttOperations =  require("./support/mqttOperations.js")
const relatorioHandler =  require("./support/relatorioHandler.js")

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set("views", "./views");

app.use(express.static(path.join(__dirname,"public")))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


global.arrayCount = 10
global.runnigFlag = 0
global.tempos = new Array();




app.get("/", function(req, res){
    
    res.render('config')
})

app.get("/config", function(req, res){
    res.render('config')
})

app.get("/running", function(req, res){
    res.render('running')
})

app.post("/start", function(req, res){
    console.log("req.body.tempoMaximo: " + req.body.tempoMaximo)
    //publicar o tempo na tag MQTT
    mqttOperations.publishLigaRandom(req.body.tempoMaximo, req.body.distMinima)
    relatorioHandler.zeraListaTempos()
    runnigFlag = 1
    res.redirect('./running')
})

app.get("/relatorio", function(req, res){
    runnigFlag = 0
    var temposJson = [];

    console.log("relatorios tempos.length: " + tempos.length)
    console.log("relatorios temposJson: " + temposJson)
    var i = 1, summ = 0, ArrayLen = tempos.length;
    while (i < ArrayLen) {
        console.log("tempos[i]: " + tempos[i])
        summ = summ + parseInt(tempos[i]);
        tempoVal = tempos[i];
        i++;
        temposJson.push({ "tempo": tempoVal})
    }
    summ = summ / 1000
    media = summ/ ArrayLen
    var soma = JSON.stringify(summ);
    var mediaJ = JSON.stringify(media);
    

    //res.render('admin/adminSalasListOperacao',{salas_blocos:salas_blocos,userDbInfo: userDbInfo})
    res.render('relatorio',{temposJson:temposJson, soma:summ, media:media})
})

app.listen(8081,function(){
    console.log("Servidor rodando localhost na porta 8081")
});



