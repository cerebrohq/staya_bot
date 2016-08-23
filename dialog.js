var builder = require('botbuilder');
var messages = require('./messages');
var data = require('./data');
var query = require('./func');

var dcommand = new builder.IntentDialog();

module.exports = dcommand;

/*dcommand.matches('1', '/test'); 
dcommand.matches('^(adquery)', builder.DialogAction.beginDialog('/adquery')); 
dcommand.matches('^(adcount)', builder.DialogAction.beginDialog('/adcount')); 
dcommand.matches('^(площадка)', builder.DialogAction.beginDialog('/setresource')); 
dcommand.matches('^(работа|сменить работу)', builder.DialogAction.beginDialog('/changew'));
dcommand.matches('^старт|начать', builder.DialogAction.beginDialog('/start'));
dcommand.matches('^стоп|прекратить', builder.DialogAction.beginDialog('/stop'));
dcommand.matches('^(миша|заново)', builder.DialogAction.beginDialog('/restartNew'));
dcommand.matches('/^(отменить|потом)/i', builder.DialogAction.endDialog(messages.cancel));*/


function doCommand(session, args)
{
    if (data.isListen(session.message)) {
        if (/^(stayabot не слушай|ыефнфище не слушай|стаябот не слушай)/i.test(session.message.text)) {
            session.beginDialog('/stopListen'); 
        } else if (/^(stayabot слушай|ыефнфище слушай|стаябот слушай)/i.test(session.message.text)) {
            session.beginDialog('/startListen');
        } else if (/^(adtest)/i.test(session.message.text)) {
            session.beginDialog('/test');  // hidden
        } else if (/^(adquery)/i.test(session.message.text)) {
            session.beginDialog('/adquery');  // hidden    
        } else if (/^(adcount)/i.test(session.message.text)) {
            session.beginDialog('/adcount');  // hidden
        } else if (/^(площадка)/i.test(session.message.text)) {
            session.beginDialog('/setresource');  // hidden
        } else if (/^(работа|сменить работу)/i.test(session.message.text)) {
            session.beginDialog('/changew');  
        } else if (/^(старт|начать)/i.test(session.message.text)) {
            session.beginDialog('/start');  
        } else if (/^(стоп|прекратить)/i.test(session.message.text)) {
            session.beginDialog('/stop');  
        } else if (/^(миша|заново)/i.test(session.message.text)) {
            session.beginDialog('/restartNew');  
        } else if (/^(помощь|help)/i.test(session.message.text)) {
            session.send(messages.helpMessage);
        } else {
            session.send(messages.helloText);  
            session.send(messages.helpMessage);
        }
    } else if (/^(stayabot слушай|ыефнфище слушай|стаябот слушай)/i.test(session.message.text)) {
        session.beginDialog('/startListen');
    }  
}; 

dcommand.onBegin
(
function (session, args, next) {
    
    console.log('begin 1'); 
    data.addUser(session.message);     
    if (!data.user(session.message).profs) {   
        session.send(messages.beginText); 
        session.beginDialog('/changew');         
    } else {        
        doCommand(session, args);
    }
}
);

dcommand.onDefault
([
function (session, args, next) {
    
    console.log('default 1');   
    data.addUser(session.message);
    if (data.user(session.message).profs) {          
         doCommand(session, args);       
    } else {
        session.send(messages.beginText); 
        session.beginDialog('/changew');      
    }    
}
]);

