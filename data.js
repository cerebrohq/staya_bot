
var trace = require('./trace');

/*
var user = {
    address : null
,   profs: null
,   time: null
};
*/

var listUsers = {};

function userId(message)
{
    var id = null;
    if (message)
        id = message.user.id;

        return id;
};

function addUser(message)
{ 
    var id = userId(message);
    if (id) {        
        trace.log('addUser befor', id, listUsers[id])
        if (listUsers[id]) {
            listUsers[id].address = message.address;
        } else {
            listUsers[id] = {};
            listUsers[id].address = message.address;
        }
        trace.log('addUser after', listUsers[id]) 
    }    
};

function removeUser(message)
{ 
    var id = userId(message);
    if (id) {
        trace.log('removeUser befor', id, listUsers[id])
        delete listUsers[id];
        trace.log('removeUser after', listUsers[id]) 
    }

    
};

function setProfs(message, profs)
{
    var id = userId(message);    
    if (id)  {
        trace.log('setProfs befor', id, listUsers[id])
        listUsers[id].profs = profs;
        trace.log('setProfs after', listUsers[id])  
    } 
};

function setTimeSend(message, time)
{  
    var id = userId(message);   
    if (id)  { 
        trace.log('setTimeSend befor', id, listUsers[id])
        listUsers[id].time = time;
        trace.log('setTimeSend after', listUsers[id])  
    }
};

function user(message)
{ 
    var id = userId(message);
    trace.log('user', id, listUsers[id])
    return listUsers[id]; 
};

function users()
{ 
    trace.log('users', listUsers)
    return listUsers;   
};

module.exports.addUser = addUser;
module.exports.removeUser = removeUser;
module.exports.setProfs = setProfs;
module.exports.setTimeSend = setTimeSend;
module.exports.user = user;
module.exports.users = users;

