var builder = require('botbuilder');
var request = require("request")
var messages = require('./messages');


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


function sendWork(time, bot, user)
{    
    console.log(time);
    var timeDate = new Date();
    timeDate.setTime(time - 5);
    var utcDate = new Date(Date.UTC(timeDate.getFullYear(), timeDate.getMonth(), timeDate.getDate(), timeDate.getHours(), timeDate.getMinutes(), timeDate.getSeconds()));        
    
    var strtime = utcDate.toISOString();
    strtime = strtime.replace('T', '%20');
    strtime = strtime.replace(' ', '%20');
    strtime = strtime.slice(0, -5);
    console.log(strtime); 
   var area = (user.area) ? user.area : 'http://jobs.staya.vc';
    
    var url =  area + '/api/jobs?limit=15&order_by=created_at&direction=desc&order_by=created_at&created_from=' + strtime + '&prof_areas=' + user.profs.join(',');

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
            if (user.address.channelId == 'slack') {
                tagurlbegin = '<';
                tagurlend = '>'
            }
            for (var i = 0; i < vacancy.length; i++) { 
                var strheader = '###' + vacancy[i].topic + '\n\n';
                var strtext = vacancy[i].description_short;
                
                var strurl = '\n\n' + tagurlbegin + vacancy[i].url + '?utm_source=bot&utm_campaign=bot&utm_medium=' + user.address.channelId + tagurlend; 
                //'http://jobs.staya.vc/?utm_source=bot&utm_medium=telegram_bot&utm_campaign=bot'

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
                    msg.text(tagurlbegin + vacancy[i].url + '?utm_source=bot&utm_campaign=bot&utm_medium=' + user.address.channelId + tagurlend)
                    msg.channelData = ({unfurl_links:"true", unfurl_media:"true"});
                }

                bot.send(msg); 
            }    
            /*var msg = new builder.Message()
                            .address(user.address)
                            .text('test111');  
            bot.send(msg); */                       
            console.log('sendWork end');             
        }
    });
                
};


module.exports.changeWork = changeWork;
module.exports.sendWork = sendWork;