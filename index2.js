//jan 31 2017
//node-express-reddit-clone workshop
//REFERENCE: https://github.com/DecodeMTL/node-express-reddit-clone

//=====Dependencies=============================================================
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var mysql = require('promise-mysql');

var app = express();

// Specify the usage of the Pug template engine
app.set('view engine', 'pug');


//=====Middleware===============================================================
// This middleware will parse the POST requests coming from an HTML form, and put the result in req.body.  Read the docs for more info!
//this "objectifies" HTML form data
//REFERENCE: 
app.use(bodyParser.urlencoded({
    extended: false
})); //??? why is this false when last workshop it was true? This uses querystring library vs qs. Does it matter??

// This middleware will parse the Cookie header from all requests, and put the result in req.cookies.  Read the docs for more info!
//REFERENCE: https://github.com/expressjs/cookie-parser
app.use(cookieParser());

// This middleware will console.log every request to your web server! Read the docs for more info!
//REFERENCE: https://www.npmjs.com/package/morgan
app.use(morgan('dev'));

/*
IMPORTANT!!!!!!!!!!!!!!!!!
Before defining our web resources, we will need access to our RedditAPI functions.
You will need to write (or copy) the code to create a connection to your MySQL database here, and import the RedditAPI.
Then, you'll be able to use the API inside your app.get/app.post functions as appropriate.
*/

// create a connection to our Cloud9 server
var connection = mysql.createPool({
    host: 'localhost',
    user: 'myeoh27',
    password: '',
    database: 'reddit',
    connectionLimit: 10
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);

//====Resources=================================================================
//1) Homepage~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/* NOTES
    v1 - Display homepage with posts ordered by NEW
    v2 - update reddit.js for getAllPosts to take in 2nd param "sortMethod"
*/
app.get('/', function(req, res) {

    req = redditAPI.getAllPosts({
            numPerPage: 40,
            page: 0
        })
        .then(function(bigPostsTable) {
            //console.log(bigPostsTable);
            res.render('post-list', {
                posts: bigPostsTable
            }); 
            
            //*********Need to improve on votes data. I'm getting vote numbers for posts that haven't been voted on.
        })
        .catch(function(error) {
            console.log("Error happened", error);
        });

});

// //2) Login Page~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// app.get('/login', function(request, response) {
//     // code to display login form
// });

// app.post('/login', function(request, response) {
//     // code to login a user
//     // hint: you'll have to use response.cookie here
// });


// //3) Signup Page~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// app.get('/signup', function(request, response) {
//     // code to display signup form
// });

// app.post('/signup', function(request, response) {
//     // code to signup a user
//     // ihnt: you'll have to use bcrypt to hash the user's password
// });

// //4) Votes functionality~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// app.post('/vote', function(request, response) {
//     // code to add an up or down vote for a content+user combination
// });


//====Listen====================================================================
var port = process.env.PORT || 3000;
app.listen(port, function() {
    // This part will only work with Cloud9, and is meant to help you find the URL of your web server :)
    if (process.env.C9_HOSTNAME) {
        console.log('Web server is listening on https://' + process.env.C9_HOSTNAME);
    }
    else {
        console.log('Web server is listening on http://localhost:' + port);
    }
});
