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
        if (results.response && /^(отменить|потом)/i.test(results.response)) {
            session.endDialog(messages.cancel);
        } else if (results.response && session.userData.profession_list)  {
            var profs = results.response.split(/\D+/);          
            for (var i = 0; i < profs.length; i++) {
                var id = Number(profs[i]);
                if (id && id > 0) {
                    profIds[profIds.length] = session.userData.profession_list[id-1].id;   
                }                       
            }

            if (profIds.length > 0) {
                data.setProfs(session.message, profIds);            
            }

            if (profIds.length > 0) {
                session.endDialog(messages.goоdMessage);                
                var timeDate = new Date();           
                data.setTimeSend(session.message, timeDate.getTime());                
                timeDate.setDate(timeDate.getDate() - 3);
                query.sendWork(timeDate.getTime(), bot, data.user(session.message));
            } else {
                session.endDialog(messages.badMessage); 
            }                       
        }
        else {
            session.endDialog(messages.badMessage);
        }                
    }
]);

bot.dialog('/start',  [
    function (session) {  
        
        if (!data.user(session.message).profs) {
            session.endDialog(); 
            session.beginDialog('/changew');
        } else {
            session.endDialog(messages.goоdMessage); 
            var timeDate = new Date();           
            data.setTimeSend(session.message, timeDate.getTime());                
            timeDate.setDate(timeDate.getDate() - 3);
            query.sendWork(timeDate.getTime(), bot, data.user(session.message));                          
        }        
    },
    function (session, results) {        
           
    }
]);

bot.dialog('/stop',  [
    function (session) {  
        data.setTimeSend(session.message, null);  
        session.send(messages.shutdownMessage);
        session.endDialog();          
    },
    function (session, results) {        
           
    }
]);

bot.dialog('/stopListen',  [
    function (session) {  
        data.setDoNotListen(session.message, true);  
        session.send(messages.stopListen);
        session.endDialog();          
    },
    function (session, results) {        
           
    }
]);

bot.dialog('/startListen',  [
    function (session) {  
        data.setDoNotListen(session.message, false);  
        session.send(messages.startListen);
        session.send(messages.helloText);
        session.send(messages.helpMessage);
        session.endDialog();          
    },
    function (session, results) {        
           
    }
]);

bot.dialog('/restartNew',  [
    function (session) {  
        data.removeUser(session.message, function () {
            session.endDialog(); 
            session.beginDialog('/'); 
        });           
    },
    function (session, results) {        
           
    }
]);

bot.dialog('/addelete',  [
    function (session) { 
        console.log('addelete 1');  
        builder.Prompts.text(session, 'input id');         
    },
    function (session, results) {
        console.log('addelete 2'); 
        if (results.response) {       
            data.removeUserDb(results.response, function (del) {                
                session.endDialog(del.toString());            
            });  
        } else {
            session.endDialog(messages.badMessage); 
        }  
    }
]);

bot.dialog('/aduser',  [
    function (session) { 
        console.log('aduser 1'); 
        builder.Prompts.text(session, 'input id');                 
    },
    function (session, results) {        
            console.log('aduser 2', results.response);  
            if (results.response) {
                data.getUserDb(results.response, function (user) {
                    var area = (user && user.area) ? user.area : 'http://jobs.staya.vc';
                    var str = (user) ? ('time ' + user.time + ' profs ' + user.profs + ' address 1 ' + JSON.parse(user.address).user.id + ' address 2 ' + JSON.parse(user.address).conversation.id + ' area ' + area + ' flags ' + user.flags) : 'user not exists';
                    session.endDialog(str);   
                }); 
            } else {
                session.endDialog(messages.badMessage); 
            }  
    }   
]);


function getUrl(str) // 'invalid' - is invalid url
{
    var url = str;
    if (/^(http)/i.test(str) || /^(<http)/i.test(str))
    {
        if (url[0] == '<') {
            url = str.substring(1, url.length)
        }

        if (url[url.length-1] == '>') {
            url = url.substring(0, url.length - 1)
        }

        if (url[url.length-1] == '/') {
            url = url.substring(0, url.length - 1)
        }

        if (url == 'http://jobs.staya.vc') {
            url = null;
        }        
    } 
    else {
        url = 'invalid';
    }

    return url;
};

bot.dialog('/adsetresource',  [
    function (session) { 
        console.log('adsetresource 1');  
        builder.Prompts.text(session, 'input id');                
    },function (session, results) { 
        console.log('adsetresource 2');  
        session.userData.uid = results.response; 
        builder.Prompts.text(session, 'unput resource');         
    },
    function (session, results) {
        console.log('adsetresource 3'); 
        if (session.userData.uid && results.response) {
            var str = getUrl(results.response);
            if (str == 'invalid') {
                session.userData.uid = null;
                session.endDialog(messages.badMessage);
            } else {
                data.setAreaDb(session.userData.uid, str, function (set) {                    
                    session.userData.uid = null; 
                    session.endDialog(set.toString());            
                });
            } 
        } else {
            session.endDialog(messages.badMessage); 
        }         
        
    }
]);

bot.dialog('/setresource',  [
    function (session, profs) { 
        console.log('setresource 1');         
        builder.Prompts.text(session, messages.selectArea);                   
    },
    function (session, results) { 
        console.log('setresource 2'); 
        if (results.response && /^(отменить|потом)/i.test(results.response)) {
            session.endDialog(messages.cancel);
        } else if (results.response) {
            var str = getUrl(results.response);
            if (str == 'invalid') {
                session.endDialog(messages.badMessage);
            } else {
                data.setArea(session.message, str);  

                session.endDialog(); 
                session.beginDialog('/start');
            }                       
        } else {
            session.endDialog(messages.badMessage);
        }             
    }
]);

bot.dialog('/test',  [
    function (session) { 
        console.log('test 1'); 
        var user = data.user(session.message);
        var area = (user.area) ? user.area : 'http://jobs.staya.vc';
        session.endDialog('time ' + user.time + ' profs ' + user.profs.join(',') + ' address 1 ' + user.address.user.id + ' address 2 ' + user.address.conversation.id + ' group ' + user.address.conversation.isGroup + ' area ' + area + ' flags ' + user.flags);          
    },
    function (session, results) {        
        console.log('test 2');    
    }   
]);

bot.dialog('/adquery',  [
    function (session) { 
        console.log('adquery 1'); 
        data.getUserDb(data.userId(session.message), function (user) {
            var area = (user && user.area) ? user.area : 'http://jobs.staya.vc';
            var str = (user) ? ('time ' + user.time + ' profs ' + user.profs + ' address 1 ' + JSON.parse(user.address).user.id + ' address 2 ' + JSON.parse(user.address).conversation.id + ' group ' + JSON.parse(user.address).conversation.isGroup + ' area ' + area + ' flags ' + user.flags) : 'user not exists';
            session.endDialogWithResult({ response: str });  
        });       
                 
    },
    function (session, results) {        
        console.log('adquery 2');    
    }   
]);

bot.dialog('/adcount',  [
    function (session) { 
        console.log('adcount 1'); 
        data.getSizeDb(session.message, function (count) {
            var str = 'count ' + count;
            session.endDialog(str);   
        });       
                 
    },
    function (session, results) {        
        console.log('adcount 2');    
    }   
]);

setInterval(function() {
                users = data.users();                
                for (var id in users) {
                    var user = users[id];
                    if (user && user.time && user.profs) {
                        var newtime = new Date().getTime();
                        if ((newtime - user.time) >= 600000) {
                            var sendtime = user.time; 
                            users[id].time = newtime;
                            data.setTimeSendDb(id, newtime);    
                            query.sendWork(sendtime, bot, user);
                        }
                    }   
                }
                
        }, 600000);   





