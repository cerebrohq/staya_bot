var builder = require('botbuilder');
var messages = require('./messages');
var data = require('./data');
var query = require('./func');

var dcommand = new builder.CommandDialog();

module.exports = dcommand;

//dcommand.matches('^(ресурс|сменить ресурс)', builder.DialogAction.beginDialog('/changer'));
dcommand.matches('^(работа|сменить работу)', builder.DialogAction.beginDialog('/changew'));
dcommand.matches('^старт|начать', builder.DialogAction.beginDialog('/start'));
dcommand.matches('^стоп|прекратить', builder.DialogAction.beginDialog('/stop'));
dcommand.matches('^(миша|заново)', builder.DialogAction.beginDialog('/restartNew'));
dcommand.matches('^(отменить|потом)', builder.DialogAction.endDialog(messages.cancel)); 


dcommand.onBegin
(
function (session, args, next) {
    
    console.log('begin 1'); 
    data.user.address = session.message.address;     
    /*if (!data.user.area) {
        session.send(messages.beginText); 
        session.beginDialog('/changer');
    } else*/ if (!data.user.user_professions) {   
        session.send(messages.beginText); 
        session.beginDialog('/changew');         
    } else {
        session.send(messages.helloText);  
        session.send(messages.helpMessage);  
    }
}
);

dcommand.onDefault
([
function (session, args, next) {
    
    console.log('default 1');   
    data.user.address = session.message.address;  
    
     if (data.user.user_professions) { // && data.user.area
        session.send(messages.helloText);
        session.send(messages.helpMessage);         
     } else {
       session.send(messages.helpMessage); 
       next();
    }
    
},
function (session, results) {   
    console.log('default 2');      
}
]);

