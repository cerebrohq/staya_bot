var builder = require('botbuilder');
var messages = require('./messages');
var data = require('./data');
var dcommand = require('./dialog');
var query = require('./func');


var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


var bot = new builder.UniversalBot(connector); 
bot.dialog('/', dcommand);

module.exports.connector = connector;

bot.dialog('/changew',  [
    function (session) { 
         console.log('changew 1');
          builder.Prompts.text(session, 'минутку'); 
         query.changeWork(session); 
         session.endDialog();                      
    }
]);

bot.dialog('/changewResult',  [
    function (session, profs) { 
        console.log('changewResult 1');         
        builder.Prompts.text(session, profs + '\n\n' + messages.select);                   
    },
    function (session, results) {
        console.log('changewResult 2');

        var profIds = Array();
        if (results.response && session.userData.profession_list)
        {
            var profs = results.response.split(/\D+/);          
            for (var i = 0; i < profs.length; i++) {
                var id = Number(profs[i]);
                if (id && id > 0) {
                    profIds[profIds.length] = session.userData.profession_list[id-1].id;   
                }                       
            }                      
        }  

        if (profIds.length > 0) {
            data.user.user_professions = profIds;
            data.user.time = new Date().getTime(); 
        }

        if (profIds.length > 0 && data.user.time) {
             //console.log('data user', data.user);
            if (data.user.area) {
                session.endDialog(messages.goоdMessage); 
                
                var timeDate = new Date();           
                timeDate.setDate(timeDate.getDate() - 3);              

                query.sendWork(timeDate.getTime(), bot, data.user.area, data.user.user_professions, data.user.address);  
                console.log(data.user.time);
            } else {
                 session.endDialog();
                 session.beginDialog('/changer');    
            }     
        } else {
            session.endDialog(messages.badMessage); 
        }        
    }
]);

bot.dialog('/changer',  [
    function (session) { 
         console.log('changer 1'); 
         query.changeResource(session); 
         session.endDialog();           
    }
]);


bot.dialog('/changerResult', [
    function (session, resources) { 
         console.log('changerResult 1');
         builder.Prompts.choice(session, messages.selectResource, resources, {listStyle: builder.ListStyle["list"]});            
    },
    function (session, results) {
        console.log('changerResult 2');

        if (results.response && session.userData.resource_list)
        {
            var resourceName = results.response.entity;   
            var resouce = '';                
            for (var i = 0; i < session.userData.resource_list.length; i++) {               
                if (resourceName == session.userData.resource_list[i].name) {
                    resouce = session.userData.resource_list[i].server;  
                    break;
                }                       
            }                      
        }  
        
        if (resouce) {
            data.user.area = resouce;
            data.user.time = new Date().getTime(); 
        }

        if (resouce != '') { 
            //console.log('data user', data.user);          
            if (data.user.user_professions) {                
                session.endDialog(messages.goоdMessage); 
                var timeDate = new Date();           
                timeDate.setDate(timeDate.getDate() - 3);              

                query.sendWork(timeDate.getTime(), bot, data.user.area, data.user.user_professions, data.user.address);                
            } else {
                session.endDialog(); 
                session.beginDialog('/changew');    
            }           
        } else {            
            session.endDialog(messages.badMessage); 
        }                
    }    
]);

bot.dialog('/start',  [
    function (session) {  
        
        if (!data.user.user_professions) {
            session.endDialog(); 
           session.beginDialog('/changew');
        } else {
            //session.beginDialog('/timer');            
            session.endDialog(messages.goоdMessage); 
            data.user.time = new Date().getTime();
            var timeDate = new Date();           
            timeDate.setDate(timeDate.getDate() - 3);
            query.sendWork(timeDate.getTime(), bot, data.user.area, data.user.user_professions, data.user.address);                          
        }        
    },
    function (session, results) {        
           
    }
]);

bot.dialog('/stop',  [
    function (session) {  
        data.user.time = null; 
        session.send(messages.shutdownMessage);
        session.endDialog();          
    },
    function (session, results) {        
           
    }
]);

bot.dialog('/restartNew',  [
    function (session) {  
        data.user.resource = null; 
        data.user.user_professions = null;
        session.endDialog(); 
        session.beginDialog('/');    
    },
    function (session, results) {        
           
    }
]);

setInterval(function() {                

                if (data.user.time && data.user.user_professions) {
                    var sendtime = data.user.time; 
                    data.user.time = new Date().getTime();
                    query.sendWork(sendtime, bot, data.user.area, data.user.user_professions, data.user.address); 
                }
        }, 300000);   





