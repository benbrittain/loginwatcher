var readline = require('readline');
var request = require('request');
var request = request.defaults({jar: true})
var path = require('path');
var express = require('express');
var app = express();
app.use(express.static('public'));

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("RIT ID: ", function(username) {
  rl.question("password: ", function(password) {
    var getUserData = function(user, func) {
      // auth so people don't have to give me passwords
      var formData = {
        'username': username,
        'password': password
      };
      request.post({url:'https://fastapps.rit.edu/kronosTimecard/login', formData: formData},
          function (err, response, body) {
            request.get('https://fastapps.rit.edu/kronosTimecard/rest/employeebyusername/' + user,
                function (error, response, body) {
                  var json = JSON.parse(body)["list"][0];
                  var name = json["fullname"];
                  var id = json["employeeid"];
                  var badgenum = json["badgenum"];
                  var payperiod = json["payperiods"][0];
                  request.get('https://fastapps.rit.edu/kronosTimecard/rest/timecard/' + id + '/' + payperiod['start_date'] + '/' + payperiod['end_date'],
                      function (error, response, body) {
                        resp = {};
                        resp["fullname"] = name;
                        resp["id"] = id;
                        resp["badgenum"] = badgenum;
                        resp["punches"] = JSON.parse(body)["punchlist"];
                        func(resp);
                      });
                });
          });
    }

    app.get('/', function(req, res) {
      res.sendFile(path.join(__dirname + '/public/index.html'));
    });

    // shitty regex.
    app.get('/user/[a-z]*[0-9]*', function(req, res) {
      var user = req.path.split('/')[2];
      getUserData(user, function(resp) {
        res.send(resp);
      });
    });

    var server = app.listen(3000, function () {
      var host = server.address().address;
      var port = server.address().port;
      console.log('loginwatcher listening on http://%s:%s', host, port);
    });
  });
});
