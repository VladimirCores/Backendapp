
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

// ================================================
// INSTALL MongoDB for use with CloudFoundry
// ================================================
if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-2.0'][0]['credentials'];
}
else{
  var mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"db-backendapp",
    "safe":"true"
  }
}

var generate_mongo_url = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');
  
  console.log("MONGO params : hostname = " + obj.hostname);
  console.log("MONGO params : port = " + obj.port);
  console.log("MONGO params : db = " + obj.db);

  if(obj.username && obj.password){
    return ("mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db);
  }
  else{
    return process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

var mongourl = generate_mongo_url(mongo);
console.log("mongourl = " + mongourl);

// ================================================
// END MongoDB for use with CloudFoundry
// ================================================

// ================================================
// process.env.VMC_APP_PORT - for CloudFoundry
// ================================================
var app = express();
var port = (process.env.PORT || process.env.VMC_APP_PORT || 3000); 
var host = (process.env.VCAP_APP_HOST || 'localhost'); 

app.configure(function(){
  app.set('port', port);
  app.set('host', host);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express.cookieParser("secret"));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.get('env'));
  console.log("MongoDB will be listening on port %d", mongo['port']);
});

/*
  Publish to CloudFoundry
        1. vmc --help : for get help
        2. vmc apps : look what app currently running
          2.1. A Node.js installation matching the version of Node.js on your Cloud Foundry instance.
          2.2. vmc runtimes : for check runtime versions
        3. vmc push Backendapp --runtime node08: initialize loading operation with services and Node.js v.8
        4. curl backendapp.cloudfoundry.com : show current html page or result of application execution
        5. vmc update Backendapp
        6. vmc logs Backendapp
        7. vmc delete Backendapp : for delete app
*/
/*
  Run MongoDB as Service
        1. Run Mongo CLI tool, type 'help' for common command
        2. switch to your database by: use db-backendapp
        3. Use code below for inserting data into mongoDB
*/

var mng             = require('mongodb'),
    Db              = mng.Db,
    Server          = mng.Server,
    ReplSetServers  = mng.ReplSetServers,
    ObjectID        = mng.ObjectID,
    Binary          = mng.Binary,
    GridStore       = mng.GridStore,
    Code            = mng.Code,
    BSON            = mng.pure().BSON,
    assert          = require('assert');

console.log("DEFINE MONGO connection");
var connection;
var locations;
Db.connect(mongourl, function(err, conn)
{
  if(err) console.log(err);
  else
  {
    connection = conn;
    locations = connection.collection('locations');
  }
});

var data = {};

// create location when "post" event is fired
app.post('/db/locations', function(req, res) {
    data = req.body;
    data.ip = req.connection.remoteAddress;
    data.time = new Date();
    require('mongodb').connect(mongourl, {safe:true}, function(err, conn) {
        conn.collection('locations', function(err, coll){
            coll.insert(data, {safe:true}, function(err) {
                res.set('Content-Type', 'json');
                res.set("Access-Control-Allow-Origin","*");
                res.send(data)
            });
        });
    });
});

app.get('/db/locations/delete', function(req, res) 
{
    if(locations)
    locations.drop(function(err, reply) {
        res.writeHead(200, {
                      "Content-Type": "text/html",
                      "Access-Control-Allow-Origin":"*"
                  });
        res.end("<strong>Database Cleared!</strong> <br/><a href='../../..'>back</a>");
    });
});

app.get('/db/locations', function(req, res) 
{
  var params = req.query;
  var startIndex = params["index"];
  //locations.find({}).each(function(doc){}); 
  if(startIndex != undefined)
  {
    locations.find({}, { skip:startIndex, limit:5 }, function(err, cursor) 
    {
      var result = '<table width="840px"  align="center" border="1" bordercolor="#333333" cellpadding="0" cellspacing="0">'+
                      '<tr>'+
                        '<th scope="col" width="120px">First Name</th>'+
                        '<th scope="col" width="120px">Last Name</th>'+
                        '<th scope="col" width="120px">EMail</th>'+
                        '<th scope="col" width="120px">Country</th>'+
                        '<th scope="col" width="120px">City</th>'+
                        '<th scope="col" width="120px">Date</th>'+
                        '<th scope="col" width="120px">IP</th>'+
                      '</tr>';
      cursor.each(function(err, item) 
      {
        if(item == null) 
        {
            // If the item is null then the cursor is exhausted/empty and closed
            result += '</table>';
            cursor.toArray(function(err, items) {
              res.writeHead(200, {
                      "Content-Type": "text/html",
                      "Access-Control-Allow-Origin":"*"
                  });
              res.end(result);
            });
        }
        else
        { 
            result += "<tr>"
                    +   "<td>" + item.name + "</td>" 
                    +   "<td>" + item.lastname + "</td>" 
                    +   "<td>" + (item.email || "NONE") + "</td>" 
                    +   "<td>" + item.country + "</td>" 
                    +   "<td>" + item.city + "</td>" 
                    +   "<td>" + (item.time || 0) + "</td>" 
                    +   "<td>" + (item.ip || 0)+ "</td>" 
            result += "</tr>"
        }
      });
    });
  } 
  else
  {
    locations.count(function(err, count){
        res.writeHead(200, {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin":"*"
        });
        res.end(String(count));
    });
  }  
});

app.post('/htmls/music/set', function(req, res) {
  var data = req.body;
  data.ip = req.connection.remoteAddress;
  data.time = new Date();
  require('mongodb').connect(mongourl, {safe:true}, function(err, conn) {
        conn.collection('albums', function(err, coll){
            coll.insert(data, {safe:true}, function(err) {
                res.writeHead(200, {
                    "Content-Type": "text/html",
                    "Access-Control-Allow-Origin":"*"
                });
                res.end("INSERTED\n");
            });
        });
    });
});

app.get('/htmls/music/get', function(req, res) {
    //require('mongodb').connect(mongourl, function(err, conn) {
        connection.collection('albums', function(err, coll) {
            coll.find(function(err, cursor) {
                cursor.toArray(function(err, items){
                    res.set('Content-Type', 'json');
                    res.set("Access-Control-Allow-Origin","*");
                    res.send(items);
                });
            });
        });
    //});
});



