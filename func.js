var builder = require('botbuilder');
var request = require("request");
var messages = require('./messages');
var htmlToText = require('html-to-text');


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
            /*if (user.address.channelId == 'slack') {
                tagurlbegin = '<';
                tagurlend = '>'
            }*/
            for (var i = 0; i < vacancy.length; i++) { 
                var strheader = '';
                if (user.address.channelId == 'slack') {
                    strheader = '**' + vacancy[i].topic + '**\n\n';
                } else {
                    strheader = '###' + vacancy[i].topic + '\n\n';
                }
                var strtext = vacancy[i].description_short;
                
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
    });
                
};


function testSendWork(type, bot, user)
{    
    console.log('testSendWork start');
    var timeDate = new Date();
    //timeDate.setTime(time - 5);
    var utcDate = new Date(Date.UTC(timeDate.getFullYear(), timeDate.getMonth(), timeDate.getDate(), timeDate.getHours(), timeDate.getMinutes(), timeDate.getSeconds()));        
    
    var strtime = utcDate.toISOString();
    strtime = strtime.replace('T', '%20');
    strtime = strtime.replace(' ', '%20');
    strtime = strtime.slice(0, -5);     
   var area = (user.area) ? user.area : 'http://jobs.staya.vc';
    
    var url =  area + '/api/jobs?limit=15&order_by=created_at&direction=desc&order_by=created_at&created_from=' + strtime + '&prof_areas=' + user.profs.join(',');

    
     
    
    request({
        url: url,
        json: true
        }
        , function (error, response, body) {

        if (!error && response.statusCode === 200) {
            
           /*var msg = new builder.Message()
                        .address(user.address)
                        .text('http://' + type);
            msg.channelData = ({unfurl_links:"true"});
            bot.send(msg);*/
			
			var textplain = htmlToText.fromString('3D Environment Artist<span style="margin-right:0.3em;"> </span><span style="margin-left:-0.3em;">(</span>Mobile RPG) Компания Plarium приглашает 3D Environment Artist в&nbsp;команду Mobile Games, которая раб...', {
												wordwrap: 130
											});			

            var msge = new builder.Message()
                        .address(user.address)
                        .text(textplain);
            msge.channelData = ({unfurl_links:"true"});
            bot.send(msge);
            var msge1 = new builder.Message()
                        .address(user.address)
                        .text("**test**\n\ntr *sfga* `fdhsgh` **dthgs dfh** *sdfga*");
            msge1.channelData = ({unfurl_links:"true"});
            bot.send(msge1);
            if (/^(u)/i.test(type)) {
                type = type.substring(1, url.length);
                var msg = new builder.Message()
                        .address(user.address)
                        .text('http://' + type);
                msg.channelData = ({unfurl_links:"true", unfurl_media:"true"});
                bot.send(msg);
            } else if (type == 1) {            
                var msg1 = new builder.Message()
                        .address(user.address)
                        .text("<http://jobs.staya.vc/job/157?utm_source=bot&utm_campaign=bot&utm_medium=slack>");
                msg1.channelData = ({unfurl_links:"true"});
                bot.send(msg1);  
            } else if (type == 2) {
                type = type.substring(4, url.length);
                var msg = new builder.Message()
                        .address(user.address)
                        .text('http://jobs.staya.vc/job/158?utm_source=bot&utm_campaign=bot&utm_medium=slack');
                msg.channelData = ({unfurl_links:"true"});
                bot.send(msg);
            } else if (type == 3) {
                type = type.substring(4, url.length);
                var msg = new builder.Message()
                        .address(user.address)
                        .text("<http://jobs.staya.vc/job/159?utm_source=bot&utm_campaign=bot&utm_medium=slack>");
                msg.channelData = ({unfurl_links:"true", unfurl_media:"true"});
                bot.send(msg);
            } else if (type == 4) {
                type = type.substring(4, url.length);
                var msg = new builder.Message()
                        .address(user.address)
                        .text("http://jobs.staya.vc/job/160?utm_source=bot&utm_campaign=bot&utm_medium=slack");
                msg.channelData = ({unfurl_links:"true", unfurl_media:"true"});
                bot.send(msg);
            } else if (/^(str )/i.test(type)) {
                type = type.substring(4, url.length);
                var msg = new builder.Message()
                        .address(user.address)
                        .text(type);
                msg.channelData = ({unfurl_links:"true", unfurl_media:"true"});
                bot.send(msg);
            } else if (type == 'youtube1') {
                type = type.substring(4, url.length);
                var msg = new builder.Message()
                        .address(user.address)
                        .text("<https://www.youtube.com/watch?v=GFt3nzvkTNM>");
                msg.channelData = ({unfurl_links:"true", unfurl_media:"true"});
                bot.send(msg);
            } else if (type == 'youtube2') {
                type = type.substring(4, url.length);
                var msg = new builder.Message()
                        .address(user.address)
                        .text("https://www.youtube.com/watch?v=axSiV-fr_UA");
                //msg.channelData = ({unfurl_links:"true", unfurl_media:"true"});
                bot.send(msg);
            } else if (type == 'youtube3') {
                type = type.substring(4, url.length);
                var msg = new builder.Message()
                        .address(user.address)
                        .text("https://www.youtube.com/watch?v=E-jDBXHJfZE");
                msg.channelData = ({unfurl_links:"true", unfurl_media:"true"});
                bot.send(msg);
            } else if (type == 'youtube4') {
                type = type.substring(4, url.length);
                var msg = new builder.Message()
                        .address(user.address)
                        .text("<http://creativerussia.staya.vc/job/205>");
                msg.channelData = ({unfurl_links:"true"});
                bot.send(msg);
            } else {

                var msg2 = new builder.Message()
                        .address(user.address)
                        .text("xbfghnfg hfghg http://creativerussia.staya.vc/job/205");
                msg2.channelData = ({parse: "full",
                                        unfurl_links: "true", 
                                        unfurl_media: "false",                                       
                                        as_user: "false"});
                bot.send(msg2); 

                var msg3 = new builder.Message()
                        .address(user.address)
                        .text("<https://jobs.staya.vc/job/155/?utm_source=bot&utm_campaign=bot&utm_medium=slack>");
                msg3.channelData = ({"unfurl_links":"true"});
                bot.send(msg3);  

                var msg4 = new builder.Message()
                        .address(user.address)
                        .text("dfhsdfgsf\n\n<https://jobs.staya.vc/job/167?utm_source=bot&utm_campaign=bot&utm_medium=slack>")
                        .setChannelData({parse: "full", 
                                        unfurl_links: "true",                                       
                                        unfurl_media: "true",
                                        as_user: "true"});
                bot.send(msg4); 

                var msg5 = new builder.Message()
                        .address(user.address)
                        .text("<http://creativerussia.staya.vc/job/189>");
                msg5 = msg5.sourceEvent({parse: "full",
                                        unfurl_links: "true",
                                        unfurl_media: "true",
                                        as_user: "true"});
                bot.send(msg5);   
            }          
                            
            console.log('testSendWork end');             
        }
    });
                
};


module.exports.changeWork = changeWork;
module.exports.sendWork = sendWork;
module.exports.testSendWork = testSendWork;