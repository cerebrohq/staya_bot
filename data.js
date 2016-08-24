
var trace = require('./trace');
var sql = require('./db');

var listUsers = {};


function initDb()
{
    sql.initDb(listUsers);    
}

function addUserDb(id, address)
{
    var db = sql.db();
    
    db.get('select count(*) as count from users where id = ?', id, function (err, row) {
        if (err) {
            trace.log('addUserDb error', id, err);
        } else {
            trace.log('addUserDb exists', id, row.count);            
            var query = (row.count > 0) ? 'update users set address=? where id = ?' : 'insert into users (id, address) values (?,?)';           
            var stm = db.prepare(query);

            if (row.count > 0) {
                stm.run(JSON.stringify(address), id);
            } else {
                stm.run(id, JSON.stringify(address));
            }
            
            stm.finalize();
        }
    });
}

function getUserDb(message, callback)
{
    var db = sql.db();
    var id = userId(message);
    db.get('select * from users where id = ?', id, function (err, row) {
        if (err) {
            trace.log('getUserDb error', id, err);
        } else {
            trace.log('getUserDb exists', id, row != null);
            callback(row);            
        }
    });
}

function getSizeDb(message, callback)
{
    var db = sql.db();
    db.get('select count(*) as count from users', function (err, row) {
        if (err) {
            trace.log('getSizeDb error', err);
        } else {
            trace.log('getSizeDb exists', row != null);
            callback(row.count);            
        }
    });
}

function removeUserDb(id, callback)
{
    var db = sql.db();    
    db.get('select count(*) as count from users where id = ?', id, function (err, row) {
        if (err) {
            trace.log('removeUserDb error', id, err);
        } else {
            trace.log('removeUserDb exists', id, row.count);
            if(row.count > 0) {
                var stm = db.prepare('delete from users where id=?');
                stm.run(id);
                stm.finalize();
            }            
        }
        callback();
    });
}

function setProfsDb(id, profs)
{
    var db = sql.db();
    db.get('select count(*) as count from users where id = ?', id, function (err, row) {
        if (err) {
            trace.log('setProfsDb error', id, err);
        } else {
            trace.log('setProfsDb exists', id, row.count);
           if(row.count > 0) {
                var stm = db.prepare('update users set profs=? where id = ?');
                stm.run(JSON.stringify(profs), id);
                stm.finalize();
            } 
        }
   });
};


function setTimeSendDb(id, time)
{ 
    var db = sql.db(); 
    db.get('select count(*) as count from users where id = ?', id, function (err, row) {
        if (err) {
            trace.log('setTimeSendDb error', id, err);
        } else {
            trace.log('setTimeSendDb exists', id, row.count);
           if(row.count > 0) {
                var stm = db.prepare('update users set time=? where id = ?');
                stm.run(time, id);
                stm.finalize();
            } 
        }
    });
};

function setAreaDb(id, area)
{
    var db = sql.db();
    db.get('select count(*) as count from users where id = ?', id, function (err, row) {
        if (err) {
            trace.log('setAreaDb error', id, err);
        } else {
            trace.log('setAreaDb exists', id, row.count);
           if(row.count > 0) {
                var stm = db.prepare('update users set area=? where id = ?');
                stm.run(area, id);
                stm.finalize();
            } 
        }
    });
};

function setFlagsDb(id, flags)
{
    var db = sql.db();
    db.get('select count(*) as count from users where id = ?', id, function (err, row) {
        if (err) {
            trace.log('setFlagsDb error', id, err);
        } else {
            trace.log('setFlagsDb exists', id, row.count);
           if(row.count > 0) {
                var stm = db.prepare('update users set flags=? where id = ?');
                stm.run(flags, id);
                stm.finalize();
            } 
        }
    });
};

function userId(message)
{
    var id = null;
    if (message)
        id = message.address.conversation.id;

        return id;
};

function addUser(message)
{ 
    var id = userId(message);
    if (id) {        
        addUserDb(id, message.address);
        trace.log('addUser befor', id, listUsers[id] != undefined)
        if (listUsers[id]) {
            listUsers[id].address = message.address;
        } else {
            listUsers[id] = {};
            listUsers[id].address = message.address;
        }
        trace.log('addUser after', listUsers[id] != undefined) 
    }   
};

function removeUser(message, callback)
{ 
    var id = userId(message);
    if (id) {
        removeUserDb(id, callback);
        trace.log('removeUser befor', id, listUsers[id] != undefined)
        delete listUsers[id];
        trace.log('removeUser after', listUsers[id] != undefined) 
    }    
};

function setProfs(message, profs)
{
    var id = userId(message);    
    if (id)  {
        setProfsDb(id, profs);
        trace.log('setProfs befor', id, listUsers[id] != undefined)
        listUsers[id].profs = profs;
        trace.log('setProfs after', listUsers[id] != undefined)  
    } 
};

function setTimeSend(message, time)
{  
    var id = userId(message);   
    if (id)  { 
        setTimeSendDb(id, time);
        trace.log('setTimeSend befor', id, listUsers[id] != undefined)
        listUsers[id].time = time;
        trace.log('setTimeSend after', listUsers[id] != undefined)  
    }
};

function hasFlag(flags, bit)
{
	return ((flags & (1 << bit))!=0);
}

function setFlag(direct, flags, bit)
{
	return (direct)?(flags | (1<<bit)):(flags & ~(1<<bit));
}

function setDoNotListen(message, direct)
{  
    var id = userId(message);   
    if (id)  { 
        var flags = (listUsers[id].flags) ? listUsers[id].flags : 0;
        trace.log('setDoNotListen befor', flags)
        flags = setFlag(direct, ((flags) ? flags : 0), 1);
        trace.log('setDoNotListen after', flags)
        setFlagsDb(id, flags);
        trace.log('setDoNotListen befor', id, listUsers[id] != undefined)        
        listUsers[id].flags = flags;
        trace.log('setDoNotListen after', listUsers[id] != undefined)  
    }
};

function setArea(message, area)
{  
    var id = userId(message);   
    if (id)  { 
        setAreaDb(id, area);
        trace.log('setArea befor', id, listUsers[id] != undefined)
        listUsers[id].area = area;
        trace.log('setArea after', listUsers[id] != undefined)  
    }
};

function user(message)
{ 
    var id = userId(message);
    trace.log('user', id, listUsers[id] != undefined)
    return listUsers[id]; 
};

function isListen(message)
{
    var id = userId(message);
    if (id && listUsers[id].flags)  {                
        return !hasFlag(listUsers[id].flags, 1); 
    }
    return true;
}

function users()
{ 
    return listUsers;
};


module.exports.initDb = initDb;
module.exports.getUserDb = getUserDb;
module.exports.getSizeDb = getSizeDb;
module.exports.setTimeSendDb = setTimeSendDb;
module.exports.setArea = setArea;
module.exports.addUser = addUser;
module.exports.removeUser = removeUser;
module.exports.setProfs = setProfs;
module.exports.setTimeSend = setTimeSend;
module.exports.setDoNotListen = setDoNotListen;
module.exports.isListen = isListen;
module.exports.user = user;
module.exports.users = users;


