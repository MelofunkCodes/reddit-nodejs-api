// load the mysqlPromise library
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


//==========CODE EXECUTION=======================
// //===FEATURE - Create User and Create Post=======
// redditAPI.createUser({
//   username: 'applesFOlyfe',
//   password: 'derp'
// })
// .then(function(user){
//     console.log(user); //testing to see if user created
  
//     return redditAPI.createPost({
//         title: 'Waddup world',
//         url: 'https://www.reddit.com/',
//         userId: user.id
//       });
// })
// .then(function(post){
//   console.log(post);
//   connection.end();
// })
// .catch(function(error){
//     console.log("Error happened", error);
  
//   connection.end();

// });

//=====LOGIN==================================
// redditAPI.checkLogin("hello123", "xxx")
// .then(function(user){
//   console.log(user);
//   connection.end();
// })
// .catch(function(error){
//   console.log(error);
//   connection.end();
// });

//console.log("Session Token: ", redditAPI.createSessionToken().length ); //returns length ranging from 180-190 characters

// redditAPI.createSession(2) //create a token for user id = 2
// .then(function(result){
//   console.log(result);
//   connection.end();
// })
// .catch(function(error){
//   console.log(error);
//   connection.end();
// });

// redditAPI.getUserFromSession("3d4vc3h3c4u3j2u3j522c5v6k2h3f5d3b2g5fv332o6w55565h6j6d5fe4z1r5l2z101v5k59546r5a2lz6b0534f4q19645a5e2da3v1v551e46q1t701b6bz3v652482m1e3q5k4v76l4u5z3x38636f4i3h49j23686d404w63441x3z1q5q3y5wx")
// .then(function(result){
//   console.log(result);
//   connection.end();
// })
// .catch(function(error){
//   console.log(error);
//   connection.end();
// });
// //===creating posts with existing users===
// redditAPI.createPost({
//   title: 'Saturday sale downtown MTL',
//   url: 'http://www.google.ca',
//   userId: 9,
//   subredditId: 6 //if I input a subredditId that does not exist, error will show
// })
// .then(function(post){
//   console.log(post);
//   connection.end();
// })
// .catch(function(error){
//     console.log("Error happened", error);
  
//   connection.end();

// });


//===FEATURE - Displaying all posts=======
redditAPI.getAllPosts({
  numPerPage: 2,
  page: 0
}, "new")
.then(function(bigPostsTable){
  console.log(bigPostsTable);
  connection.end();
})
.catch(function(error){
    console.log("Error happened", error);
  
  connection.end();

});

// //===FEATURE - getAllPostsForUser========================
// redditAPI.getAllPostsForUser(2)
// .then(function(result){
//   console.log("Posts for user \"" + result[0].username + "\":");
//   console.log(result);
//   connection.end();
// })
// .catch(function(error){
//     console.log("Error happened", error);
  
//   connection.end();

// });

// //===FEATURE - getSinglePost========================
// redditAPI.getSinglePost(6)
// .then(function(result){
//   console.log("Post for user \"" + result.username + "\":");
//   console.log(result);
//   connection.end();
// })
// .catch(function(error){
//     console.log("Error happened", error);
  
//   connection.end();

// });


// //===============SUBREDDIT PART=======================
// //===FEATURE - getSinglePost==========================
// redditAPI.createSubreddit({
//   name: 'chitchat',
//   description: null
// })
// .then(function(result){
//   console.log(result);
//   connection.end();
// })
// .catch(function(error){
//   console.log("Error happened", error);
//   connection.end();
// });

// //===FEATURE - getAllSubreddits=======================
// redditAPI.getAllSubreddits()
// .then(function(result){
//   console.log(result);
//   connection.end();
// })
// .catch(function(error){
//   console.log("Error happened", error);
//   connection.end();
// });

// //===FEATURE - createOrUpdateVote=========================
// redditAPI.createOrUpdateVote({
//   postId: 6,
//   userId: 3,
//   vote: -1
// })
// .then(function(result){
//   console.log(result);
//   connection.end();
// })
// .catch(function(error){
//   console.log("Error happened", error);
//   connection.end();
// });