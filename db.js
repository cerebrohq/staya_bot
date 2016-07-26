var trace = require('./trace');
var fs = require("fs");
var file = "./../data/test.db";
var sqlite3 = require("sqlite3")    


var database = null; 

function initDb(listUsers) {
    var exists = fs.existsSync(file);
    if(!exists) {
        trace.log("Creating DB file.");
        fs.openSync(file, "w");
    }

    var newdb = new sqlite3.Database(file);
    newdb.serialize(function() {
        if(!exists) {
            newdb.run("CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL, address TEXT, profs TEXT, time INTEGER, area TEXT)"); //
        } else {
            newdb.all('pragma table_info(users)', function (err, rows) {
                var has = false;
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i].name == 'area')
                    {
                        has = true;                        
                        break;
                    }
                }
                trace.log('initDb has area column', has);
                if (!has) {
                    var stm = newdb.prepare('ALTER TABLE users ADD COLUMN area TEXT');
                    stm.run();
                    stm.finalize();                     
                }
                newdb.close();
            });
        } 

        newdb.each("select * from users", function(err, row) {
            if (err) {
                trace.log('initDb error', err);
            } else {
                user = {};
                user.address = JSON.parse(row.address);
                user.profs = JSON.parse(row.profs);
                user.time = row.time;
                user.area = row.area;
                listUsers[row.id] = user;
            }
        });
    }); 
    if(!exists)
        newdb.close();  
};

function db() {
    if (!database)
        database = new sqlite3.Database(file);
    
    return database;
}

module.exports.initDb = initDb;
module.exports.db = db;




