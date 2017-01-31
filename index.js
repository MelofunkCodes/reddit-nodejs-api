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
// //=========================================================
// //Exercise 2B
// //Playing with URL params
// app.get('/hello/:name', function(req, res) {
//     console.log('your request is', req.params);

//     res.send('<h1>Hello ' + req.params.name + '!</h1>');

// }); // URL will look like this... '/hello/John'

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

// //=========================================================
// //Exercise 4
var mysql = require('promise-mysql');

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


// app.get('/posts', function(req, res) {

//     req = redditAPI.getAllPosts({
//             numPerPage: 5,
//             page: 0
//         })
//         .then(function(bigPostsTable) {
//             console.log(bigPostsTable);

//             var beginningHTML =
//                 `<div id="posts">
//                 <h1>List of Posts</h1>
//                     <ul class="posts-list">`;

//             var posts = [];

//             bigPostsTable.forEach(function(eachPost) {

//                 var middleHTML =
//                     `<li class="post-item">
//                     <h2 class="content-item__title">
//                         <a href="` + eachPost.url + `">` + eachPost.title + `</a>
//                     </h2>
//                     <p>Created by ` + eachPost.user.username + `</p>
//                 </li>`;

//                 posts.push(middleHTML);
//             });

//             console.log("your posts (before JOIN) are: ", posts);
//             var x = posts.join("");
//             console.log("your posts are: ", posts);

//             var endHTML = `</ul>
//                         </div>`;


//             res.send(beginningHTML + x + endHTML);

//             connection.end();
//         })
//         .catch(function(error) {
//             console.log("Error happened", error);
//             connection.end();
//         });
// });

// //=========================================================
// //Exercise 5
// app.get('/createContent', function(req, res) {
//     res.send(
//         `<form action="/createContent" method="POST"> <!-- what is this method="POST" thing? you should know, or ask me :) -->
//     <div>
//         <input type="text" name="url" placeholder="Enter a URL to content">
//     </div>
//     <div>
//         <input type="text" name="title" placeholder="Enter the title of your content">
//     </div>
//     <button type="submit">Create!</button>
//     </form>
//   `);
// });

//=========================================================
//Exercise 6

var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // to support URL-encoded bodies

app.get('/posts/:ID', function(req, res) {
    var postID = req.params.ID;
    console.log("req.params is...", postID, typeof postID);

    redditAPI.getSinglePost(+postID)
        .then(function(result) {
            var beginningHTML =
                `<div id="posts">
                <h1>List of Posts</h1>
                    <ul class="posts-list">`;


                var middleHTML =
                    `<li class="post-item">
                    <h2 class="content-item__title">
                        <a href="` + result.url + `">` + result.title + `</a>
                    </h2>
                    <p>Created by ` + result.username + `</p>
                    </li>`;

            var endHTML = `</ul>
                        </div>`;


            res.send(beginningHTML + middleHTML + endHTML);
            //connection.end();
        })
        .catch(function(error) {
            console.log("Error happened", error);

        });
}) //this works! but I can't get it to be redirected here from line 223

app.post('/createContent', function(req, res) {

    //console.log("req.body is...", req.body);

    redditAPI.createPost({
            title: req.body.title,
            url: req.body.url,
            userId: 7,
            subredditId: 6
        })
        .then(function(post) {
            console.log("post: ", post, typeof post);
            //res.send(post); // this will display actual post object that was created on the website (option 2)
            
           var redirectURL = '/posts/' + post.id;
            res.redirect(redirectURL); //option 4

            //connection.end();

        })
        .catch(function(error) {
            console.log("Error happened", error);
            res.status(500).send('500 Error');

        });
});

//=========================================================
//Exercise 7
app.set('view engine', 'pug');

//re-writing exercise 5 to be Pug-friendly
app.get('/createContent', function(req, res) {
   res.render('create-content');
});

// //re-writing exercise 4 to be Pug-friendly
app.get('/posts', function(req, res) {

    req = redditAPI.getAllPosts({
            numPerPage: 5,
            page: 0
        })
        .then(function(bigPostsTable) {
            //console.log(bigPostsTable);
            res.render('post-list', {posts: bigPostsTable});
            //connection.end(); //ending the connection causes the pool to close
        })
        .catch(function(error) {
            console.log("Error happened", error);
        });


});



//=========================================================
/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
