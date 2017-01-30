//expressjs-workshop
//REFERENCE: https://github.com/DecodeMTL/expressjs-workshop

var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello Woop!');
});

// //Exercise 1
// app.get('/hello', function (req, res) {
//   res.send('<h1>Hello Hot dog!!</h1>');
// });


//Exercise 2
//if client requests '/hello?name=John'
app.get('/hello', function (req, res){
    console.log('your request is', req.query);
    
    var firstName = req.query.name;
    
    res.send('<h1>Hello '+ firstName + '!</h1>');
    
})



/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});