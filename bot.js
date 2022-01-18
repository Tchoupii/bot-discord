const Discord = require("discord.js");
const config = require("./config.json")
const commands = require('./commands');
const fs = require('fs');
const mqtt = require('mqtt')
const clientJSON = require('./client.json');

var tabClientName = ['Crypteo', 'DSI'];


let obj = {};

for (var i = 0; i < tabClientName.length; i++){
  
  obj[tabClientName[i]] = new Array()
  obj[tabClientName[i]]['apiKey'] = clientJSON[tabClientName[i]]['apiKey'];
  obj[tabClientName[i]]['port'] = clientJSON[tabClientName[i]]['port'];
  obj[tabClientName[i]]['discordChannel'] = clientJSON[tabClientName[i]]['discordChannel']
  obj[tabClientName[i]]['mqttuser'] = clientJSON[tabClientName[i]]['mqttuser']
  obj[tabClientName[i]]['mqttpassword'] = clientJSON[tabClientName[i]]['mqttpassword']
}

console.log(obj);
if (obj["Crypteo"]["mqttuser"]) {
	const mqttClient  = mqtt.connect('mqtt://mqtt.crypteo.net', {username:obj["Crypteo"]["mqttuser"], password:obj["Crypteo"]["mqttuser"]});
	mqttClient.on('connect', function () {console.log('MQTT connecté')});
}

// création du client 
const client = new Discord.Client();
// connexion avec le bot 
client.login(config.BOT_TOKEN);
let prefix = require("./config.json");


// lancement du bot
prefix = prefix.PREFIX;

client.on('ready',()=>
	console.log('Bot connecté')
);

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
  
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	
  const cmd = args.shift().toLowerCase();
  console.log(cmd)
  if (!commands[cmd]) return;	
  commands[cmd].execute(message, args);
})

// Création du serveur Express
const express = require('express');
const app = express();
//const https = require('https');
const http = require('http');
   

http.createServer({
    key: fs.readFileSync('/opt/ssl/crypteo.net.key'),
    cert: fs.readFileSync('/opt/ssl/crypteo.net.crt'),
}, app)
.listen(port, function() {
	console.log('server started');
}) 

// Ecoute sur le lien 
var request = require("request");
app.get('/', function (req, res)  {
  let number = req.query.number
  let src = req.query.src
  let client = req.query.client
  console.log(number);
  if (!number) {
  	res.send('Error');
	return;
  }
  if(client == "crypteo"){
    request({uri: "https://annuaire.crypteo.net/api/get.php?t="+obj["Crypteo"]['apiKey']+"&n="+number}, 
    function(error, response, body) {
        console.log(body);
        let text = "Appel "+(src?src:'')+": "+body.trim()+' ('+number+')';
        console.log(text);
        client.channels.cache.get(obj["Crypteo"]["discordChannel"]).send(text);          
  //client.publish('crypteo', text);
  mqttClient.publish('crypteo/accueil', text);
        res.send('Ok'); 
      })
  }
  else if(client == "dsi"){
    request({uri: "https://annuaire.crypteo.net/api/get.php?t="+obj["DSI"]['apiKey']+"&n="+number}, 
    function(error, response, body) {
        console.log(body);
        let text = "Appel "+(src?src:'')+": "+body.trim()+' ('+number+')';
        console.log(text);
        client.channels.cache.get(obj["DSI"]["discordChannel"]).send(text);          
  //client.publish('crypteo', text);
  mqttClient.publish('dsi/accueil', text);
        res.send('Ok'); 
      })
  }
  
  
  
}) 
