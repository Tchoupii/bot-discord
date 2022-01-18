
const service = require('./service.js');
service.init('https://annuaire.crypteo.net/api/');
const login = 'Crypteo';
const pass = 'Chkdsk77';

const commands = {	
    "add": {
        "info": "Ajoute un numéro dans l'annuaire",
        "infodetail": "<code>Ajout numero societe:\n/add numero,societe\n\nAjout numero avec nom:\n/add numero,prenom,nom\n\nAjout numero avec nom et societe\n/add numero,societe,prenom,nom</code>",
        "execute": function(msg, req) {

        req = req[0].split(',');
        let data = {};
	req = req.map(e=>e.trim());
        if (req.length == 2) {
            data.number = req[0];
            data.company = req[1];	  
        } else if (req.length == 3) {
            data.number = req[0];
            data.firstname = req[1];
            data.lastname = req[2];
        } else if (req.length == 4) {
            data.number = req[0];
            data.company = req[1];
            data.firstname = req[2];
            data.lastname = req[3];
        } else {
            msg.channel.send("Je n'ai pas compris");
            return;
        } 

        service.call('User','login',[login,pass])
        .then(function() {
            service.call('Contact', 'save', data)
            .then(function() {
            msg.channel.send('Ok');
                service.call('User','logout');
            })
            .catch(function(error) {
            console.log(error);
            msg.channel.send(error.message);
            });
        });	
        }
    },
    "num": {
        "info":"Retourne un numéro de l'annuaire",
        "execute":function(msg, req) {
                    
        service.call('User','login',[login,pass])
        .then(function() {
            service.call('Contact', 'findNumber', req)
            .then(function(result) {
            msg.channel.send(result);
                service.call('User','logout');
            })
            .catch(function(error) {
            console.log(error);
            msg.channel.send(error.message);
            });
        });	
        }
    },
    "who": {
        "info":"Cherche un numéro dans l'annuaire",
        "execute":function(msg, req) {
                    
        service.call('User','login',[login,pass])
        .then(function() {
            service.call('Contact', 'who', req)
            .then(function(result) {
            msg.channel.send(result);
                service.call('User','logout');
            })
            .catch(function(error) {
            console.log(error);
            msg.channel.send(error.message);
            });
        });

        }	
    },
    "help": {
        "execute": function(msg, req) {
        
        let resp = "Liste des commandes\n";
        Object.keys(commands).forEach(key => {
            if (commands[key].info) {
            resp+="<b>"+key+"</b> : "+commands[key].info+"\n";
            if (commands[key].infodetail) resp+=commands[key].infodetail+"\n\n";
            }
        });
        console.log(resp);
        msg.channel.send(resp, {'parse_mode':'html'});			
        }
    }
}

module.exports = commands