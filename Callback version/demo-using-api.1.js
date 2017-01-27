// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'myeoh27', 
  password : '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection); //huh??? By passing "connection" not reddit variable, you are passing lines 2-10. But why don't you just put it into reddit.js??
  //Alan said by doing it this way, if we create more API's in different files, we can just pass them the connection versus copy+pasting it to the top of each file

// It's request time!
redditAPI.createUser({
  username: 'hello23',
  password: 'xxx'
}, function(err, user) {
  if (err) {
    console.log(err);
  }
  else {
    redditAPI.createPost({
      title: 'hi reddit!',
      url: 'https://www.reddit.com',
      userId: user.id
    }, function(err, post) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(post);
      }
    });
  }
});
