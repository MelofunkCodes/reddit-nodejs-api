//jan 31 2017
//node-express-reddit-clone workshop
//REFERENCE: https://github.com/DecodeMTL/node-express-reddit-clone

//notes:
/*
1. To delete cookies, go to Dev Tools, Resources, Cookies...click on it and hit delete!
*/

//=====Dependencies=============================================================
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan'); //morgan logs out 
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

// This middleware will console.log every request to your web server! Read the docs for more info!
//REFERENCE: https://www.npmjs.com/package/morgan
app.use(morgan('dev'));

// This middleware will parse the Cookie header from all requests, and put the result in req.cookies.  Read the docs for more info!
//this adds a 'cookies' property to the request, an object of key:value pairs for all the cookies we set
//REFERENCE: https://github.com/expressjs/cookie-parser
app.use(cookieParser());

function checkLoginToken(request, response, next) {
    //checks if there is a SESSION cookie...
    if (request.cookies.SESSION) {
        return redditAPI.getUserFromSession(request.cookies.SESSION)
            .then(function(user) {
                // if we get back a user object, set it on the request. From now on, this request looks like it was made by this user as far as the rest of the code is concerned
                if (user) {
                    request.loggedInUser = user;
                }

                next();
            });
    }
    else {
        //if no SESSION cookie, move forward
        next();
    }
}

// Adding the middleware to our express stack. This should be AFTER the cookieParser middleware
app.use(checkLoginToken);


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
function displayHomepage(req, res, sortingMethod) {
    //console.log("sortingMethod of displayHomepage: ", sortingMethod);

    if (req.loggedInUser) {
        var user = req.loggedInUser[0];
    }

    var sorts = [{
        title: "new",
        url: "/new"
    }, {
        title: "top",
        url: "/top"
    }, {
        title: "hot",
        url: "/hot"
    }, {
        title: "controversial",
        url: "/controversial"
    }];

    var method = {
        name: sortingMethod,
        url: "/" + sortingMethod
    }

    if (!sortingMethod) {
        method.url = "/";
    }

    redditAPI.getAllPosts({
            numPerPage: 40,
            page: 0
        }, sortingMethod)
        .then(function(bigPostsTable) {
            res.render('post-list', {
                posts: bigPostsTable,
                user: user,
                sorts: sorts,
                sortingMethod: method
            });
        })
        .catch(function(error) {
            console.log("Error happened", error);
        });

}

function postHomepage(req, res, sortingMethod) {
    //console.log("I'm here " + sortingMethod);
    // //testing to see if the button user clicked is for the correct post, correct vote value, and correct user
    //console.log("req.body: ", req.body, typeof req.body); //everything in req.body is a STRING!!
    // console.log("req.body.postId: ", req.body.postId, typeof req.body.postId); //string
    // console.log("req.loggedInUser[0].id: ", req.loggedInUser[0].id, typeof req.loggedInUser[0].id);//number
    // console.log("req.body.vote: ", req.body.vote, typeof req.body.vote);//string

    //console.log("sortingMethod of postHomepage: ", sortingMethod); //printing out undefined

    if (req.body.vote && req.body.postId) {
        redditAPI.createOrUpdateVote({
                postId: +req.body.postId,
                userId: req.loggedInUser[0].id,
                vote: +req.body.vote
            })
            .then(function(result) {
                var redirectURL = '/' + sortingMethod;

                if (!sortingMethod) {
                    redirectURL = '/';
                }

                console.log("redirectURL: ", redirectURL);
                res.redirect(redirectURL);
            })
            .catch(function(error) {
                console.log("Error happened", error);
            });
    }

    //adding buttons for signup, login, and logout
    // console.log("req.body.signup: ", typeof req.body.signup); //string
    // console.log("req.body.login: ", typeof req.body.login); //string
    if (req.body.signup) {
        res.redirect('/signup');
    }
    if (req.body.login) {
        res.redirect('/login');
    }
    if (req.body.logout) {
        res.clearCookie('SESSION');
        res.redirect('/');
    }
    if (req.body.createPost) {
        res.redirect('createPost');
    }
}

//DEFAULT HOMEPAGE
app.get('/', function(req, res) {
    displayHomepage(req, res);
});

app.post('/', function(req, res) {
    postHomepage(req, res);
});

//homepage for "NEW"
app.get('/new', function(req, res) {
    displayHomepage(req, res, "new");
});

app.post('/new', function(req, res) {
    postHomepage(req, res, "new");
});

//homepage for "TOP"
app.get('/top', function(req, res) {
    displayHomepage(req, res, "top");
});

app.post('/top', function(req, res) {
    postHomepage(req, res, "top");
});

//homepage for "HOT"
app.get('/hot', function(req, res) {
    displayHomepage(req, res, "hot");
});

app.post('/hot', function(req, res) {
    postHomepage(req, res, "hot");
});

//homepage for "CONTROVERSIAL"
app.get('/controversial', function(req, res) {
    displayHomepage(req, res, "controversial");
});

app.post('/controversial', function(req, res) {
    postHomepage(req, res, "controversial");
});

//2) Login Page~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/login', function(req, res) {
    // code to display login form
    res.render('login');
});

app.post('/login', function(req, res) {
    // code to login a user
    // hint: you'll have to use response.cookie here

    //***QUESTION: Is there a way I can hide what user is typing in password box? Is there an npm?
    redditAPI.checkLogin(req.body.username, req.body.password)
        .then(function(user) { //user is an object if both user and password exists
            return redditAPI.createSession(user.id); //creates token for that userId
        })
        .then(function(token) {
            res.cookie('SESSION', token, {
                maxAge: 300000
            }); //assigns token from createSession, to 'SESSION' property inside cookie object
            //put maxAge just for testing. Will automatically log out user after 5 minutes

            //console.log("req.body.postId: ", req.body.postId);
            console.log("req.loggedInUser: ", req.loggedInUser);

            res.redirect('/'); //trying to redirect user to homepage but it will be personalized for them and allow them to vote

            //res.clearCookie('SESSION'); //testing -- does not work here because I'm redirecting the response before clearing the cookie. 
        })
        .catch(function(error) {
            console.log(error);
            res.status(401).send(error.message);
        });
});

//2.5) User Permissions Pages~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/createPost', function(req, res) {
    if (!req.loggedInUser) {
        res.status(401).send('You must be logged in to create content!');
    }
    else {
        res.render('create-content');
    }
});


app.post('/createPost', function(req, res) {
    if (!req.loggedInUser) {
        res.status(401).send('You must be logged in to create content!');
    }
    else {

        if (req.body.url && req.body.title) {
            //console.log("req.loggedInUser: ", req.loggedInUser, typeof req.loggedInUser);

            redditAPI.createPost({
                    title: req.body.title,
                    url: req.body.url,
                    userId: req.loggedInUser[0].id, //this is NULL
                    subredditId: 1
                })
                .then(function(post) {
                    console.log("post: ", post, typeof post);

                    var redirectURL = '/posts/' + post.id;
                    res.redirect(redirectURL);

                })
                .catch(function(error) {
                    console.log("Error happened", error);
                    res.status(500).send('500 Error');

                });
        }

        //if home button clicked
        if (req.body.home) {
            res.redirect('/');
        }
    }
})


//------Displaying pages----------------------------------------
app.get('/posts/:ID', function(req, res) {
    var postID = req.params.ID;
    //console.log("req.params is...", postID, typeof postID);

    var url = "/posts/" + req.params.ID;
    console.log("url to single-post.pug: ", url);

    redditAPI.getSinglePost(+postID)
        .then(function(result) {
            res.render('single-post', {
                post: result,
                redditposturl: url
            });
        })
        .catch(function(error) {
            console.log("Error happened", error);
        });
});
app.post('/posts/:ID', function(req, res) {
    if (req.body.home) {
        res.redirect('/');
    }
});

//3) Signup Page~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/signup', function(req, res) {
    // code to display signup form
    res.render('signup');
});

app.post('/signup', function(req, res) {
    // code to signup a user
    // hint: you'll have to use bcrypt to hash the user's password
    redditAPI.createUser({
            username: req.body.username,
            password: req.body.password
        })
        .then(function(newUser) {
            res.redirect('/login');
        })
        .catch(function(error) {
            //console.log("Error happened", error);
            res.status(422).send('Username already exists');
            //used HTTP status code based on this: http://stackoverflow.com/questions/3825990/http-response-code-for-post-when-resource-already-exists

        });
});

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
