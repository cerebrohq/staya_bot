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
                areas[address].users = Array();                
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
                trace.log('response url', response.statusCode); 
                if (!error && response.statusCode === 200) {
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
                                
                                var strurl = '\n\n' + tagurlbegin + vacancy[i].url + '?utm_source=bot&utm_campaign=bot&utm_medium=' + areaUser.address.channelId + tagurlend; 
                                
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
                                    
                    trace.log('sendWorkToUsers end', new Date());             
                }
            });
        };
        
        requestVacancies(id, areas[id].users, ago_minutes);    
    }                 
};

function sendWork(time, bot, user)
{    
    console.log('sendWork', time);
    
    
    
    /*var timeDate = new Date();
    timeDate.setTime(time - 5);
    var utcDate = new Date(Date.UTC(timeDate.getFullYear(), timeDate.getMonth(), timeDate.getDate(), timeDate.getHours(), timeDate.getMinutes(), timeDate.getSeconds()));        
    
    var strtime = utcDate.toISOString();
    strtime = strtime.replace('T', '%20');
    strtime = strtime.replace(' ', '%20');
    strtime = strtime.slice(0, -5);
    console.log(strtime); 
   var area = (user.area) ? user.area : 'http://jobs.staya.vc';
    
    var url =  area + '/api/jobs?limit=15&order_by=created_at&direction=desc&created_from=' + strtime + '&prof_areas=' + user.profs.join(',');

    console.log('sendWork start', timeDate);  
    console.log('sendWork start', url);  
     
    
    request({
        url: url,
        json: true
        }
        , function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var vacancy = body.list;     
            var tagurlbegin = '';   
            var tagurlend = '';            
            for (var i = 0; i < vacancy.length; i++) { 
                var strheader = '';
				var topic = htmlToText.fromString(vacancy[i].topic, {wordwrap: 130});
                if (user.address.channelId == 'slack') {
                    strheader = '**' + topic + '**\n\n';
                } else {
                    strheader = '###' + topic + '\n\n';
                }
                var description = htmlToText.fromString(vacancy[i].description_short, {wordwrap: 130});                
				var strtext = description;
                
                var strurl = '\n\n' + tagurlbegin + vacancy[i].url + '?utm_source=bot&utm_campaign=bot&utm_medium=' + user.address.channelId + tagurlend; 
                
                // for fucking facebook messager
                var sizeadd = strheader.length + strurl.length + 3; // 3 for ### endind header in facebook
                if (strtext.length > (299 - sizeadd)) {
                    strtext = strtext.substring(0, (296 - sizeadd)) + '...';                    
                }

                var str = strheader + strtext + strurl;
                var msg = new builder.Message()
                            .address(user.address)
                            .text(str); 

                if (user.address.channelId == 'slack') {
                    msg.channelData = ({parse: "full", unfurl_links:"true", unfurl_media:"true"});
                }             

                bot.send(msg); 
            }    
                            
            console.log('sendWork end');             
        }
    });*/
                
};


function testSendWork(type, bot, user)
{    
    console.log('testSendWork start');                            
    console.log('testSendWork end');               
};


module.exports.changeWork = changeWork;
module.exports.sendWork = sendWorkToUsers;//sendWork;
module.exports.testSendWork = testSendWork;