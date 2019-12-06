var builder = require('botbuilder');
var request = require("request");
var messages = require('./messages');
var htmlToText = require('html-to-text');
var trace = require('./trace');
var data = require('./data');

function changeWork(session)
{   
   var url = "http://jobs.staya.vc/api/prof_areas"

    request({
        url: url,
        json: true
        }
        , function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var prof = body.list;               
            var ip = 0;
            session.userData.profession_list = [];
            for (var i = 0; i < prof.length; i++) {
                if (prof[i].parent_id == null) {
                    session.userData.profession_list[ip] = prof[i];
                    ip += 1;
                }
            }                 
            var strlist = '';
            for (var i = 0; i < session.userData.profession_list.length; i++) {
                if (session.userData.profession_list[i].parent_id) {
                    strlist += '\t';
                }
                var num = i + 1;
                strlist += num + '. ' + session.userData.profession_list[i].name; 
                strlist += '\n';                
            }
           
            if (strlist != '') {                
                session.beginDialog('/changewResult', strlist);
            }                   
            console.log('request end');             
        }
    });
   
    console.log('changeWork end');
};

function hasProf(user_profs, vacancy_profs)
{
    var has = false;
    if (vacancy_profs) {
        for (var i = 0; i < vacancy_profs.length; i++) {
            var vacancyProf = (vacancy_profs[i].parent_id)?vacancy_profs[i].parent_id:vacancy_profs[i].id;           
            if (user_profs.indexOf(vacancyProf) >= 0) {
                has = true;
                break;
            }
        }
    }        
    
    return has;
};

function sendWorkToUsers(bot, allusers, ago_minutes)
{    
    trace.log('sendWorkToUsers start', new Date(), 'ago', ago_minutes);    
    
     var areas = {};    
     for (var id in allusers) {
        var user = allusers[id];        
       if (user && user.profs && data.isSended(id)) {  
            var address = (user.area) ? user.area : 'http://jobs.staya.vc';                        
            if (!areas[address]) {            
                areas[address] = {};
                areas[address].users = [];                
            }  
            areas[address].users[areas[address].users.length] = user;                
        }   
    }
    
    for (var id in areas) {        
        
    var requestVacancies = function (address, users, from_ago_minutes) {
            
            var param = (from_ago_minutes)?'?from_ago_minutes=' + from_ago_minutes:'';
            var url =  address + '/api/jobs_for_bot/10/' + param;
            
            trace.log('request url', url);  

            request({
            url: url,
            json: true
            }
            , function (error, response, body) {
                //trace.log('response url', response.statusCode); 
                if (!error) { // && response.statusCode === 200                   
                    if (body.count > 0)
                    {
                        var vacancy = body.list;
                        var tagurlbegin = '';   
                        var tagurlend = '';     
                        
                        for (var u = 0; u < users.length; u++) {                        
                            var areaUser = users[u];                        
                            //console.log('response to user', areaUser); 
                            //console.log('response url', url); 
                            //console.log('vacancy', vacancy.length); 
                            for (var i = 0; i < vacancy.length; i++) { 

                                if (hasProf(areaUser.profs, vacancy[i].prof_areas)) {
                                    
                                    if (from_ago_minutes && i > 15) {
                                        trace.log('more 15 vacancies to break');
                                        break;
                                    }                               

                                    var strheader = '';
                                    var topic = htmlToText.fromString(vacancy[i].topic, {wordwrap: 130});
                                    if (areaUser.address.channelId == 'slack') {
                                        strheader = '**' + topic + '**\n\n';
                                    } else {
                                        strheader = '###' + topic + '\n\n';
                                    }
                                    var description = htmlToText.fromString(vacancy[i].description_short, {wordwrap: 130});                
                                    var strtext = description;
                                    var domen = '';
                                    if (vacancy[i].url.startsWith('/'))
                                        domen = (areaUser.area) ? areaUser.area : 'http://jobs.staya.vc';
                                    
                                    var strurl = '\n\n' + tagurlbegin + domen + vacancy[i].url + '?utm_source=bot&utm_campaign=bot&utm_medium=' + areaUser.address.channelId + tagurlend; 
                                    
                                    // for fucking facebook messager
                                    var sizeadd = strheader.length + strurl.length + 3; // 3 for ### endind header in facebook
                                    if (strtext.length > (299 - sizeadd)) {
                                        strtext = strtext.substring(0, (296 - sizeadd)) + '...';                    
                                    }

                                    var str = strheader + strtext + strurl;
                                    var msg = new builder.Message()
                                                .address(areaUser.address)
                                                .text(str); 

                                    if (areaUser.address.channelId == 'slack') {
                                        msg.channelData = ({parse: "full", unfurl_links:"true", unfurl_media:"true"});
                                    }             

                                    bot.send(msg); 
                                }
                            }
                        } 
                    }   
                                    
                    trace.log('sendWorkToUsers end', new Date());             
                }
            });
        };
        
        requestVacancies(id, areas[id].users, ago_minutes);    
    }                 
};

function testSendWork(type, bot, user)
{    
    //console.log('testSendWork start');   
    
    trace.log('sendWorkToUsers start', new Date(), 'ago', ago_minutes);    
    
     var areas = {};    
     for (var id in allusers) {
        var user = allusers[id];        
       if (user && user.profs && data.isSended(id)) {  
            var address = (user.area) ? user.area : 'http://jobs.staya.vc';                        
            if (!areas[address]) {            
                areas[address] = {};
                areas[address].users = [];                
            }  
            areas[address].users[areas[address].users.length] = user;                
        }   
    }
    
    for (var id in areas) {        
        
    var requestVacancies = function (address, users, from_ago_minutes) {
            
            var param = (from_ago_minutes)?'?from_ago_minutes=' + from_ago_minutes:'';
            var url =  address + '/api/jobs_for_bot/10/' + param;
            
            trace.log('request url', url);  

            request({
            url: url,
            json: true
            }
            , function (error, response, body) {
                //trace.log('response url', response.statusCode); 
                if (!error) { // && response.statusCode === 200                   
                    if (body.count > 0)
                    {
                        var vacancy = body.list;
                        var tagurlbegin = '';   
                        var tagurlend = '';     
                        
                        for (var u = 0; u < users.length; u++) {                        
                            var areaUser = users[u];                        
                            //console.log('response to user', areaUser); 
                            //console.log('response url', url); 
                            //console.log('vacancy', vacancy.length); 
                            for (var i = 0; i < vacancy.length; i++) { 

                                if (hasProf(areaUser.profs, vacancy[i].prof_areas)) {
                                    
                                    if (from_ago_minutes && i > 15) {
                                        trace.log('more 15 vacancies to break');
                                        break;
                                    }                               

                                    var strheader = '';
                                    var topic = htmlToText.fromString(vacancy[i].topic, {wordwrap: 130});
                                    if (areaUser.address.channelId == 'slack') {
                                        strheader = '**' + topic + '**\n\n';
                                    } else {
                                        strheader = '###' + topic + '\n\n';
                                    }
                                    var description = htmlToText.fromString(vacancy[i].description_short, {wordwrap: 130});                
                                    var strtext = description;
                                    var domen = '';
                                    if (vacancy[i].url.startsWith('/'))
                                        domen = (areaUser.area) ? areaUser.area : 'http://jobs.staya.vc';
                                    
                                    var strurl = '\n\n' + tagurlbegin + domen + vacancy[i].url + '?utm_source=bot&utm_campaign=bot&utm_medium=' + areaUser.address.channelId + tagurlend; 
                                    
                                    // for fucking facebook messager
                                    var sizeadd = strheader.length + strurl.length + 3; // 3 for ### endind header in facebook
                                    if (strtext.length > (299 - sizeadd)) {
                                        strtext = strtext.substring(0, (296 - sizeadd)) + '...';                    
                                    }

                                    //var address = areaUser.address;
                                    //delete address.conversation;
                                    var address =
                                    {
                                        channelId: areaUser.address.channelId,
                                        user: areaUser.address.user,                                        
                                        bot: areaUser.address.bot,
                                        serviceUrl: areaUser.address.serviceUrl,
                                        useAuth: true
                                    }
                                    var str = strheader + strtext + strurl;
                                    var msg = new builder.Message()
                                                .address(address)
                                                .text(str); 

                                    if (areaUser.address.channelId == 'slack') {
                                        msg.channelData = ({parse: "full", unfurl_links:"true", unfurl_media:"true"});
                                    }             

                                    bot.send(msg); 
                                }
                            }
                        } 
                    }   
                                    
                    trace.log('sendWorkToUsers end', new Date());             
                }
            });
        };
        
        requestVacancies(id, areas[id].users, ago_minutes);    
    }

    //console.log('testSendWork end');               
};


module.exports.changeWork = changeWork;
module.exports.sendWork = sendWorkToUsers;//sendWork;
module.exports.testSendWork = testSendWork;