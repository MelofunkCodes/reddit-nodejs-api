var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;

/*
QUESTIONS:
1. demo-using-api.js - line 14. 
1A: This allows us pass a connection to however many different API "files" we use vs copy+pasting to top of every file
2. what is insertId at line 43 and 80?? 
2A: insertId is just a property included in whatever result that you have from a mysql query?
3. in getAllPosts, in what event/case would a callback not exist?
*/

module.exports = function RedditAPI(conn) {
  return {
    createUser: function(user, callback) { //because it takes a callback as 2nd argument, you have to return a callback (which is done in line 11, 24, 27, 40, 51)
      
      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else { //if password successfully hashed/encrypted, insert new username, password and creation time to users table/object
          conn.query(
            'INSERT INTO users (username,password, createdAt) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of
                them are unknown, there's a particular error about unique usernames
                which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else { //if no errors to mysql query to insert values into table, display table at the new user id
                /*
                Here we are INSERTing data, so the only useful thing we get back
                is the ID of the newly inserted row. Let's use it to find the user
                and return it
                */
                conn.query(
                  'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [result.insertId], //???what is insertId?? Property of result object? which is the posts table?
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller
                      */
                        callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },
    createPost: function(post, callback) {
      conn.query(
        'INSERT INTO posts (userId, title, url, createdAt) VALUES (?, ?, ?, ?)', [post.userId, post.title, post.url, new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              'SELECT id,title,url,userId, createdAt, updatedAt FROM posts WHERE id = ?', [result.insertId], 
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
     getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {}; // will have 2 properties: numPerPage and page
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit; // How to flip through your table, looking at it in groups of 25 rows. THIS ALLOWS FOR PAGINATION OF OUR POSTS.
      
      conn.query(`
        SELECT id, title, url, userId, createdAt, updatedAt
        FROM posts
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?`
        , [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results); //display the results
          }
        }
      );
    }
  }
}
