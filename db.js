var trace = require('./trace');
var fs = require("fs");
var file = "./../data/test.db";
var exists = fs.existsSync(file);

if(!exists) {
  trace.log("Creating DB file.");
  fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);



db.serialize(function() {
    if(!exists) {
        db.run("CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL, address TEXT, profs TEXT, time INTEGER)");
    }

    var stmt = db.prepare("INSERT INTO users (id, address) VALUES (?,?)");
    stmt.run('test', 'test1');
    stmt.finalize();
    //db.close();
});


db.serialize(function() {    

    var stmt = db.prepare("INSERT INTO users (id, address) VALUES (?,?)");
    stmt.run('test2', 'test2');
    stmt.finalize();
    db.close();
});



