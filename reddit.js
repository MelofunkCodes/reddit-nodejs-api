var bcrypt = require('bcrypt');
const saltRounds = 10;

/*
QUESTIONS:
1. demo-using-api.js - line 14. 
1A: This allows us pass a connection to however many different API "files" we use vs copy+pasting to top of every file
2. what is insertId at line 43 and 80?? 
2A: insertId is just a property included in whatever result that you have from a mysql query?
3. in getAllPosts, in what event/case would a callback not exist?

testing
4. Why is my user id skipping when I've tested the throwing error on duplicate case, and then creating a new successful user? i.e. I jumped from id 4 to 6.
4A: ID's are skipping because of their auto_increment feature. When something is created (id, post, etc), id automatically increments, but then if something causes it to fail, that id is corrupted and doesn't show in your tables. 

*/

module.exports = function RedditAPI(conn) {
    return {
      createUser: function(user) {

        // first we have to hash the password...
        return bcrypt.hash(user.password, saltRounds)
          .then(function(hashedPassword) {
            //console.log(hashedPassword)
            return conn.query(
              'INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()]);
          })
          .catch(function(err) {
            if (err.code === 'ER_DUP_ENTRY') {
              throw new Error('A user with this username already exists');
            }
            console.log(err);
          })
          .then(function(newUser) {

            return conn.query(
              'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [newUser.insertId]);

          })
          .then(function(userTable) {
            return userTable[0];
          });

      },
      createPost: function(post) {
        return conn.query(
            'INSERT INTO posts (userId, subredditId, title, url, createdAt) VALUES (?, ?, ?, ?, ?)', [post.userId, post.subredditId, post.title, post.url, new Date()])
          .then(function(newPost) {
            return conn.query(
              'SELECT id,title,url,userId, subredditId, createdAt, updatedAt FROM posts WHERE id = ?', [newPost.insertId]);
          })
          .then(function(postTable) {
            return postTable[0];
          });
      },
      getAllPosts: function(options) {

        //console.log("options: ", options);
        if (!options) {
          options = {}; //create empty object if no argument passed to getAllPosts
        }

        //if no "options" is sent to getAllPosts, limit = 25, and offset = 0 (first page)
        var limit = options.numPerPage || 25;
        var offset = (options.page || 0) * limit; // How to flip through your table, looking at it in groups of 25 rows. THIS ALLOWS FOR PAGINATION OF OUR POSTS.

        //console.log("limit: ", limit);
        //console.log("offset: ", offset);

        return conn.query(`
            SELECT 
              posts.id AS postId,
              posts.title,
              posts.url,
              posts.userId,
              posts.createdAt AS postCreatedAt,
              posts.updatedAt AS postUpdatedAt,
              users.id,
              users.username,
              users.createdAt,
              users.updatedAt,
              subreddits.id AS subredditId,
              subreddits.name AS subredditName,
              subreddits.description,
              subreddits.createdAt AS subCreatedAt,
              subreddits.updatedAt AS subUpdatedAt
            FROM users
              JOIN posts ON users.id = posts.userId
              JOIN subreddits ON posts.subredditId = subreddits.id
              ORDER BY postCreatedAt DESC
              LIMIT ? OFFSET ?`, [limit, offset])
          .then(function(bigPostsTable) {
            /*
            LOGIC
            1. Creat empty array, var posts.
            2. Use forEach to loop through bigPostsTable
            3. at eachPost, create an object, with user properties NESTED into another object
            4. push eachPost into posts array
            5. may have to return JSON.stringify(posts, null ,4);
              
            */

            var posts = [];

            bigPostsTable.forEach(function(eachPost) {
              var post = {
                id: eachPost.postId,
                title: eachPost.title,
                url: eachPost.url,
                createdAt: eachPost.postCreatedAt,
                updatedAt: eachPost.postUpdatedAt,
                userId: eachPost.userId,
                user: {
                  id: eachPost.id,
                  username: eachPost.username,
                  createdAt: eachPost.createdAt,
                  updatedAt: eachPost.updatedAt
                },
                subreddit: {
                  id: eachPost.subredditId,
                  name: eachPost.subredditName,
                  description: eachPost.description,
                  createdAt: eachPost.subCreatedAt,
                  updatedAt: eachPost.subUpdatedAt
                }
              }

              posts.push(post);
            });


            return posts;
          });

      }, //closing bracket for getAllPosts
      getAllPostsForUser: function(userId, options) {
        if (!options) {
          options = {};
        }

        var limit = options.numPerPage || 25;
        var offset = (options.page || 0) * limit;

        return conn.query(`
            SELECT 
              posts.id AS postId,
              posts.title,
              posts.url,
              posts.userId,
              users.username,
              posts.createdAt AS postCreatedAt,
              posts.updatedAt AS postUpdatedAt,
              subreddits.id AS subredditId,
              subreddits.name AS subredditName,
              subreddits.description,
              subreddits.createdAt AS subCreatedAt,
              subreddits.updatedAt AS subUpdatedAt
            FROM users
              JOIN posts ON users.id = posts.userId
              JOIN subreddits ON posts.subredditId = subreddits.id
              WHERE users.id = ?
              LIMIT ? OFFSET ?`, [userId, limit, offset])
          .then(function(userPosts) {
            var posts = [];

            userPosts.forEach(function(eachPost) {
              var post = {
                id: eachPost.postId,
                title: eachPost.title,
                url: eachPost.url,
                createdAt: eachPost.postCreatedAt,
                updatedAt: eachPost.postUpdatedAt,
                userId: eachPost.userId,
                username: eachPost.username,
                subreddit: {
                  id: eachPost.subredditId,
                  name: eachPost.subredditName,
                  description: eachPost.description || '',
                  createdAt: eachPost.subCreatedAt,
                  updatedAt: eachPost.subUpdatedAt
                }
              }

              posts.push(post);
            });

            return posts;
          });
      }, //closing bracket for getAllPostsForUser
      getSinglePost: function(postId) {
        return conn.query(`
            SELECT 
              posts.id,
              posts.title,
              posts.url,
              posts.userId,
              users.username,
              posts.createdAt,
              posts.updatedAt,
              subreddits.id AS subredditId,
              subreddits.name AS subredditName,
              subreddits.description,
              subreddits.createdAt AS subCreatedAt,
              subreddits.updatedAt AS subUpdatedAt
            FROM users
              JOIN posts ON users.id = posts.userId
              JOIN subreddits ON posts.subredditId = subreddits.id
              WHERE posts.id = ?`, [postId])
          .then(function(result) {
            return {
              id: result[0].id,
              title: result[0].title,
              url: result[0].url,
              createdAt: result[0].createdAt,
              updatedAt: result[0].updatedAt,
              userId: result[0].userId,
              username: result[0].username,
              subreddit: {
                id: result[0].subredditId,
                name: result[0].subredditName,
                description: result[0].description || '',
                createdAt: result[0].subCreatedAt,
                updatedAt: result[0].subUpdatedAt
              }
            };
          });
      }, //closing bracket for getSinglePost 
      //====================SUBREDDIT PART===============================
      createSubreddit: function(sub) {
          return conn.query(
              'INSERT INTO subreddits (name, description, createdAt) VALUES (?, ?, ?)', [sub.name, sub.description, new Date()])
            .then(function(newSub) {
              return conn.query(
                'SELECT * FROM subreddits WHERE id = ?', [newSub.insertId]);
            })
            .then(function(subTable) {
              return subTable[0];
            });
        }, //closing bracket for createSubreddit
        getAllSubreddits: function(){
          return conn.query(
            `SELECT * FROM subreddits ORDER BY createdAt DESC`)
            .then(function(result){
              var subs = [];
              
              result.forEach(function(eachSub){
                var sub = {
                  id: eachSub.id,
                  name: eachSub.name,
                  description: eachSub.description || '',
                  createdAt: eachSub.createdAt,
                  updatedAt: eachSub.updatedAt
                };
                
                subs.push(sub);
              });
              
              return subs;
            });
        }, //closing bracket for getAllSubreddits
        //================VOTING FUNCTIONALITY==========================
        createOrUpdateVote: function(vote){
         // var voteOptions = [1, 0, -1];
          
          if (vote.vote !== 1 && vote.vote !== -1){ //if user didn't vote 1, 0, or -1
            //console.log("hello weird vote");
            vote.vote = 0;
          }
          
          //console.log("vote object: ", vote);
          return conn.query(
          `INSERT INTO votes SET postId=?, userId=?, vote=?, createdAt=? ON DUPLICATE KEY UPDATE vote=?, updatedAt=?`, [vote.postId, vote.userId, vote.vote, new Date(), vote.vote, new Date()])
          .then(function(newVote){
            return conn.query('SELECT * FROM votes');
          })
          .then(function(result){
            console.log("typeof createdAt: ", typeof result.createdAt);
            return result;
          });
          
          

        }//closing bracket for createVote

    } //closing bracket for BIG return at line 14
  } //closing bracket for line 13
