CREATE TABLE subreddits (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(200),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY (name)
);

--updating existing posts in posts table to have subreddit id's
UPDATE posts SET subredditId = 6 where id = 1;
UPDATE posts SET subredditId = 6 where id = 2;
UPDATE posts SET subredditId = 3 where id = 3;
UPDATE posts SET subredditId = 3 where id = 4;
UPDATE posts SET subredditId = 4 where id = 5;
UPDATE posts SET subredditId = 1 where id = 6;
UPDATE posts SET subredditId = 2 where id = 7;
UPDATE posts SET subredditId = 4 where id = 8;
UPDATE posts SET subredditId = 6 where id = 9;
UPDATE posts SET subredditId = 6 where id = 10;

--getAllSubreddits
SELECT * FROM subreddits ORDER BY createdAt DESC\G

--updating getAllPosts* functions
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
    LIMIT ? OFFSET ?\G
    
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
  WHERE users.id = 2
  LIMIT 2 OFFSET 0\G