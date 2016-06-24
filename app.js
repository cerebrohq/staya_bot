var restify = require('restify');
var builder = require('botbuilder');
//var messages = require('./prompts');
var request = require("request")

var messages = {   
    beginText: "Здравствуйте! Stay Bot - дружелюбный Бот, \
    который найдет для вас самые интересные вакансии в системе Staya. \
    Вам осталось только указать интересные для вас профессиональные области и время, когда посылать подборку вакансий!",
    helloText: "Здравствуйте! Хотите изменить рассылку?",    
    helpMessage: "Я понимаю команды:\n\n\
    работа - сменить интересные разделы вакансий;\n\n\
    время - изменить время ежедневной рассылки;\n\n\
    старт - начать ежедневную рассылку;\n\n\
    стоп - прекратить рассылку;\n\n\
    потом - выйти из диалога.\n\n",
    timeMessage: "Задайте время, во сколько вы хотите получать ежедневную рассылку, например 18:30",
    goоdMessage: "Отлично, будем на связи, удачи ;)",    
    select: "Укажите номера интересных разделов вакансий через пробел, например: 2 4",
    cancel: "Добро, займемся позже.",
    shutdownMessage: "Хорошо, умолкаю."
};

// userData
/*{ 
    to
,   from   
,   user_professions
,   time
}*/

var userData = {};
var profession_list = new Array();

// dialog command
var dcommand = new builder.CommandDialog();

dcommand.matches('^(работа|сменить работу)', builder.DialogAction.beginDialog('/changew'))
dcommand.matches('^(время спама|время)', builder.DialogAction.beginDialog('/timer'))
dcommand.matches('^старт|начать', builder.DialogAction.beginDialog('/start'))
dcommand.matches('^стоп|прекратить', builder.DialogAction.beginDialog('/stop'))
dcommand.matches('^(отменить|потом)', builder.DialogAction.endDialog(messages.cancel)) // do not working!!!!

dcommand.onBegin
(
function (session, args, next) {
    
    console.log('begin 1'); 
    userData.to = session.message.from;
    userData.from = session.message.to;
    if (!userData.user_professions) {   
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
    userData.to = session.message.from;
    userData.from = session.message.to;
     if (userData.user_professions) {
        session.send(session.gettext(messages.helloText,  { user: session.message.from.name }) );  
        session.send(messages.helpMessage);         
     } else {
       session.send(messages.helpMessage); 
       next();
    }

},
function (session, results) {   
    console.log('default 2', userData);        
}
]);


var bot = new builder.BotConnectorBot({ appId: 'StayaBotCinesoft', appSecret: '2135b80f5c6b4c0ba24051fa1f1c0b33' });
bot.add('/', dcommand);

bot.add('/changew',  [
    function (session) { 
         console.log('changew 1');
         builder.Prompts.text(session, 'минутку');
        //session.send('секундочку');
        changeWork(session);                
    },
    function (session, results) {
        console.log('changew 2');

        var profIds = Array();
        if (results.response && profession_list)
        {
            var profs = results.response.split(/\D+/);          
            for (var i = 0; i < profs.length; i++) {
                var id = Number(profs[i]);
                if (id && id > 0) {
                    profIds[profIds.length] = profession_list[id-1].id;   
                }                       
            }                      
        }  

        if (profIds.length > 0) {
            userData.user_professions = profIds;
        }

        if (profIds.length > 0 && userData.time) {
            session.send(session.gettext(messages.goodMessage, { user: session.message.from.name }));
            session.endDialog(); 
            
            var timeDate = new Date();           
            timeDate.setDate(timeDate.getDate() - 3);              

            sendWork(timeDate.getTime());  
            console.log(userData.time);           
        } else {
            session.endDialog(); 
        }                   

        if (!userData.time) {            
            session.beginDialog('/timer');               
        }         

        console.log(profIds);                
    }
]);
 
bot.add('/timer',  [
    function (session) {  
        //session.sendMessage(messages.timeMessage);       
        builder.Prompts.text(session, messages.timeMessage);   
    },
    function (session, results) { 

        var time = new Date();
        var res = results.response.split(/\D/);    
        if (res.length > 0) {
            var h = Number(res[0]);
            if (h) {
                 time.setHours(h);   
            }

            time.setMinutes(0); 
            if (res.length > 1) {
                var min = Number(res[1]);
                if (min) {
                    time.setMinutes(min);   
                }
            }
        } 

        time.setDate(time.getDate() + 1);         
        
        userData.time = time.getTime();

        console.log(userData.time); 

        session.send(messages.goоdMessage);

        if (userData.time && userData.user_professions) {
            var timeDate = new Date();           
            timeDate.setDate(timeDate.getDate() - 3);
            sendWork(timeDate.getTime());
        }

        

        session.endDialog();        
    }
]);

bot.add('/start',  [
    function (session) {  
        session.endDialog(); 
        if (!userData.user_professions) {
           session.beginDialog('/changew');
        } else {
            session.beginDialog('/timer');   
        }        
    },
    function (session, results) {        
           
    }
]);

bot.add('/stop',  [
    function (session) {  
        userData.time = null; 
        session.send(messages.shutdownMessage);
        session.endDialog();     
    },
    function (session, results) {        
           
    }
]);

bot.add('/notify', function (session, vacancy) {
   session.endDialog(vacancy); 
});

setInterval(function() {
                if (userData.time && userData.user_professions) {
                    var now = new Date().getTime();
                    if (now >= userData.time) {
                        sendWork(userData.time);
                        userData.time = now; 
                    }
                }
        }, 20000);   

function sendWork(time)
{
    //var timeSearch = new Date();
    //var created_from = timeSearch.setDate(timeSearch.getDate() - 1);

    var now = new Date().getTime();    
    
    console.log(time);
    var timeDate = new Date();
    timeDate.setTime(time);
    timeDate.setDate(timeDate.getDate() - 1);
    var utcDate = new Date(Date.UTC(timeDate.getFullYear(), timeDate.getMonth(), timeDate.getDate(), timeDate.getHours(), timeDate.getMinutes(), timeDate.getSeconds()));        
    
    var strtime = utcDate.toISOString();
    strtime = strtime.replace('T', '%20');
    strtime = strtime.slice(0, -5);

    console.log(strtime); 
    var url = 'https://jobs.staya.vc/api/jobs?limit=15&order_by=created_at&direction=desc&order_by=created_at&created_from=' + strtime + '&prof_areas=' + userData.user_professions.join(',');

    console.log('sendWork start');  
    //console.log(url);      
    
    request({
        url: url,
        json: true
        }
        , function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var vacancy = body.list;
            
            var strlist = '';
            // return befor commit (crash emulator)
            for (var i = 0; i < vacancy.length; i++) {  //
                //var strlist = '';
                strlist += '###' + vacancy[i].topic + '\n\n';              
                strlist += vacancy[i].description_short; 
                strlist += '\n\n';
                strlist += vacancy[i].url;  
                strlist += '\n\n\n\n';                          
            }     
            
            if (strlist != '') {
                bot.beginDialog({ from: userData.from, to: userData.to }, '/notify', strlist);
            }

            //console.log(strlist);            
            console.log('sendWork end');             
        }
    });
                
};

function changeWork(session, timeSearch)
{   
   var url = "https://jobs.staya.vc/api/prof_areas"

    request({
        url: url,
        json: true
        }
        , function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var prof = body.list; 
            var ip = 0;
            for (var i = 0; i < prof.length; i++) {
                if (prof[i].parent_id == null) {
                    profession_list[ip] = prof[i];
                    ip += 1;
                }
            }
            //profession_list = prof;    

            var strlist = '';
            // return befor commit (crash emulator)
           for (var i = 0; i < profession_list.length; i++) {
                if (profession_list[i].parent_id) {
                    strlist += '\t';
                }
                var num = i + 1;
                strlist += num + '. ' + profession_list[i].name; 
                strlist += '\n';                
            }
            
            if (strlist != '') {
                session.send(strlist + '\n\n' + messages.select);
            }
            //session.send(strlist + '\n' + messages.select);
            console.log('request end');             
        }
    });
   
    console.log('changeWork end');
};


var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
    });
