//expressjs-workshop
//REFERENCE: https://github.com/DecodeMTL/expressjs-workshop

var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.send('Hello Woop!');
});


//=========================================================
// //Exercise 1
// app.get('/hello', function (req, res) {
//   res.send('<h1>Hello Hot dog!!</h1>');
// });
//=========================================================

// //Exercise 2
// //if client requests '/hello?name=John'
// app.get('/hello', function (req, res){
//     console.log('your request is', req.query);

//     var firstName = req.query.name;

//     res.send('<h1>Hello '+ firstName + '!</h1>');

// })
//=========================================================
//Exercise 2B
//Playing with URL params
app.get('/hello/:name', function(req, res) {
    console.log('your request is', req.params);

    res.send('<h1>Hello ' + req.params.name + '!</h1>');

}); // URL will look like this... '/hello/John'

//=========================================================
//Exercise 3

function operation(operator, n1, n2) {
    switch (operator) {
        case 'add':
            return n1 + n2;
        case 'subtract':
            return n1 - n2;
        case 'multiply':
            return n1 * n2;
        case 'div':
            return n1 / n2;
        default:
            return "error";
    }
}



app.get('/calculator/:operator', function(req, res) {
    // console.log('your request is ', req.params);
    // console.log('your query is: ', req.query, typeof req.query.n1);

    var result = operation(req.params.operator, +req.query.n1, +req.query.n2);
    
    // console.log('result is: ', result);

    if (result === 'error') {
        res.status(404).send('404 Error');
    }
    else {
        var obj = {
            operator: req.params.operator,
            firstOperand: req.query.n1,
            secondOperand: req.query.n2,
            solution: result
        }
        
        res.send(obj);
    }

}); //get object output when typing '.../calculator/div?n1=10&n2=20'




//=========================================================
/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
