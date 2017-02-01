--Ask Randy, Anthony, or Allen to look at their code if I haven't finished it
--Jan 28 2017 -- did not figure out sorting method way

--------------TESTING--------------------
--Top Ranking
SELECT 
  postId,
  SUM(votes.vote) AS voteScore,
  SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
  SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
FROM votes
GROUP BY postId
ORDER BY voteScore DESC;

--upVotes
SELECT 
  postId,
  SUM(votes.vote) AS upVotes
FROM votes
WHERE votes.vote > 0
GROUP BY postId;

--downVotes
SELECT 
  postId,
  SUM(votes.vote) AS downVotes
FROM votes
WHERE votes.vote < 0
GROUP BY postId;

--hotness ranking
select
    votes.postId,
    sum(votes.vote) as score,
    sum(votes.vote)/timestampdiff(DAY, posts.createdAt, now()) as hotnessScore,
    LEAST()
from posts
LEFT JOIN votes ON posts.id = votes.postId
GROUP BY posts.id\G

--controversial ranking
select
    votes.postId,
    sum(votes.vote) as score,
    SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
    SUM( if(votes.vote = -1, 1, 0) ) AS downVotes,
    LEAST(upVotes, downVotes)/(upVotes - downVotes)^2 AS controversialRating
from posts
JOIN votes ON posts.id = votes.postId
GROUP BY posts.id\G
--line 47 works if i'm not referencing the aliases



-------------------------------------------- 
--MASTER SELECT   
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
  subreddits.updatedAt AS subUpdatedAt,
  SUM(votes.vote) AS voteScore,
  SUM(votes.vote)/timestampdiff(DAY, posts.createdAt, now()) as hotnessScore,
  SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
  SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
FROM subreddits
LEFT JOIN posts ON subreddits.id = posts.subredditId
LEFT JOIN votes ON posts.id = votes.postId
LEFT JOIN users ON votes.userId = users.id
GROUP BY posts.id
ORDER BY posts.id DESC
--only outputs 6 


--sort by NEW (DEFAULT)
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
  subreddits.updatedAt AS subUpdatedAt,
  SUM(votes.vote) AS voteScore,
  SUM(votes.vote)/timestampdiff(DAY, posts.createdAt, now()) as hotnessScore,
  SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
  SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
FROM subreddits
LEFT JOIN posts ON subreddits.id = posts.subredditId
LEFT JOIN users ON posts.userId = users.id
LEFT JOIN votes ON users.id = votes.userId
GROUP BY posts.id
ORDER BY posts.createdAt DESC
LIMIT 2 OFFSET 10\G
--for some reason, for the posts that don't have votes, 

--------------------------------------------
--sort by TOP RANKING
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
  subreddits.updatedAt AS subUpdatedAt,
  SUM(votes.vote) AS voteScore,
  SUM(votes.vote)/timestampdiff(DAY, posts.createdAt, now()) as hotnessScore,
  SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
  SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
FROM subreddits
LEFT JOIN posts ON subreddits.id = posts.subredditId
LEFT JOIN users ON posts.userId = users.id
LEFT JOIN votes ON users.id = votes.userId
GROUP BY posts.id
ORDER BY voteScore DESC\G

--sort HOTNESS RANKING
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
  subreddits.updatedAt AS subUpdatedAt,
  SUM(votes.vote) AS voteScore,
  SUM(votes.vote)/timestampdiff(DAY, posts.createdAt, now()) as hotnessScore,
  SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
  SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
FROM subreddits
LEFT JOIN posts ON subreddits.id = posts.subredditId
LEFT JOIN users ON posts.userId = users.id
LEFT JOIN votes ON users.id = votes.userId
GROUP BY posts.id
ORDER BY hotnessScore DESC\G

--sort by controversial
--Controversial ranking: = numUpvotes < numDownvotes ? totalVotes * (numUpvotes / numDownvotes) : totalVotes * (numDownvotes / numUpvotes)
--trying to figure it out at line 41, haven't yet.