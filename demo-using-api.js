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
// It's request time!
redditAPI.createUser({
  username: 'applesFOlyfe',
  password: 'derp'
})
.then(function(user){
    console.log(user); //testing to see if user created
  
    return redditAPI.createPost({
        title: 'Waddup world',
        url: 'https://www.reddit.com/',
        userId: user.id
      });
})
.then(function(post){
  console.log(post);
  connection.end();
})
.catch(function(error){
    console.log("Error happened", error);
  
  connection.end();

});


// //creating posts with existing users
// redditAPI.createPost({
//   title: 'Tuxedo on Tour! 2017 dates released!',
//   url: 'http://www.mayerhawthorne.com/tuxedo-on-tour/',
//   userId: 3
// })
// .then(function(post){
//   console.log(post);
//   connection.end();
// })
// .catch(function(error){
//     console.log("Error happened", error);
  
//   connection.end();

// });


// //displaying all posts
// redditAPI.getAllPosts()
// .then(function(bigPostsTable){
//   console.log(bigPostsTable);
//   connection.end();
// })
// .catch(function(error){
//     console.log("Error happened", error);
  
//   connection.end();

// });
