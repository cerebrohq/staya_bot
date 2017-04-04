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
        console.log(session.message.text)
        if (/^(stayabot не слушай|ыефнфище не слушай|стаябот не слушай|stayabot yt ckeifq|\/stayabot не слушай)/i.test(session.message.text)) {
            session.beginDialog('/stopListen'); 
        } else if (/^(stayabot слушай|ыефнфище слушай|стаябот слушай|stayabot ckeifq|\/stayabot слушай)/i.test(session.message.text)) {
            session.beginDialog('/startListen');
        } else if (/^(adtest|\/adtest)/i.test(session.message.text)) {
            session.beginDialog('/test');  // hidden
        } else if (/^(adquery|\/adquery)/i.test(session.message.text)) {
            session.beginDialog('/adquery');  // hidden    
        } else if (/^(adcount|\/adcount)/i.test(session.message.text)) {
            session.beginDialog('/adcount');  // hidden
        } else if (/^(addelete|\/addelete)/i.test(session.message.text)) {
            session.beginDialog('/addelete');  // hidden
        } else if (/^(adsetresource|\/adsetresource)/i.test(session.message.text)) {
            session.beginDialog('/adsetresource');  // hidden
        } else if (/^(aduser|\/aduser)/i.test(session.message.text)) {
            session.beginDialog('/aduser');  // hidden
        } else if (/^(testSend|\/testSend)/i.test(session.message.text)) {
            session.beginDialog('/testSend');  // hidden      
        } else if (/^(площадка|\/площадка)/i.test(session.message.text)) {
            session.beginDialog('/setresource');  
        } else if (/^(работа|сменить работу|\/работа)/i.test(session.message.text)) {
            session.beginDialog('/changew');  
        } else if (/^(старт|начать|\/старт)/i.test(session.message.text)) {
            session.beginDialog('/start');  
        } else if (/^(стоп|прекратить|\/стоп)/i.test(session.message.text)) {
            session.beginDialog('/stop');  
        } else if (/^(миша|заново|\/миша)/i.test(session.message.text)) {
            session.beginDialog('/restartNew');  
        } else if (/^(помощь|help|\/помощь)/i.test(session.message.text)) {
            session.send(messages.helpMessage);
        } else {
            session.send(messages.helloText);  
            session.send(messages.helpMessage);
        }
    } else if (/^(stayabot слушай|ыефнфище слушай|стаябот слушай|stayabot ckeifq)/i.test(session.message.text)) {
        session.beginDialog('/startListen');
    } else if (/^(adtest)/i.test(session.message.text)) {
        session.beginDialog('/test');  // hidden
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

