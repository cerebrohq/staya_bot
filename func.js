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



function changeResource(session)
{   
   var url = "http://jobs.staya.vc/api/all_places"

    request({
        url: url,
        json: true
        }
        , function (error, response, body) {

        if (!error && response.statusCode === 200) {            
            session.userData.resource_list = body;
            var resources = [];
           
           for (var i = 0; i < session.userData.resource_list.length; i++) {
                resources[i] = session.userData.resource_list[i].name;
           }                           
           
            if (resources) {
                session.beginDialog('/changerResult', resources);               
            }            
            console.log('request end');             
        }
    });
   
    console.log('changeResource end');
};


function sendWork(time, bot, resource, profs, address)
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
    var url =  'http://' + resource + '/api/jobs?limit=15&order_by=created_at&direction=desc&order_by=created_at&created_from=' + strtime + '&prof_areas=' + profs.join(',');

    console.log('sendWork start', timeDate);  
    console.log('sendWork start', url);  
     
    
    request({
        url: url,
        json: true
        }
        , function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var vacancy = body.list;            

            for (var i = 0; i < vacancy.length; i++) { 
                var strlist = '###' + vacancy[i].topic + '\n\n';              
                strlist += vacancy[i].description_short;
                strlist += '\n\n';
                strlist += vacancy[i].url; 
                var msg = new builder.Message()
                            .address(address)
                            .text(strlist);
                bot.send(msg); 
            }                    
            console.log('sendWork end');             
        }
    });
                
};


module.exports.changeWork = changeWork;
module.exports.changeResource = changeResource;
module.exports.sendWork = sendWork;