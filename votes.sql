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

select
    votes.postId,
    sum(votes.vote) as score,
    SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
    SUM( if(votes.vote = -1, 1, 0) ) AS downVotes,
    LEAST(SUM( if(votes.vote = 1, 1, 0)) , SUM( if(votes.vote = -1, 1, 0) ))/(SUM( if(votes.vote = 1, 1, 0)) - SUM( if(votes.vote = -1, 1, 0) ))^2 AS controversialRating
from posts
JOIN votes ON posts.id = votes.postId
GROUP BY posts.id\G
--this works but UGLY

select
    votes.postId,
    sum(votes.vote) as score,
    SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
    SUM( if(votes.vote = -1, 1, 0) ) AS downVotes,
from posts
JOIN votes ON posts.id = votes.postId
GROUP BY posts.id\G

--Jacques' way (subqueries)
--the * in line 77 allows you to access all the columns you selected in subquery
--the "tbl" after subquery in line 86 is just an arbitrary name you give to that subquery TABLE. If you only want score in subquery vs everything, can access by writing "tbl.score"
select
    *,
    LEAST(upVotes, downVotes)/(upVotes - downVotes)^2 AS controversialRating
from (select
    votes.postId,
    sum(votes.vote) as score,
    SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
    SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
  from posts
  JOIN votes ON posts.id = votes.postId
  GROUP BY posts.id)tbl
  ORDER BY controversialRating DESC
  LIMIT 2;

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
    COALESCE(SUM(votes.vote), 0) AS voteScore, --COALESCE takes as many params as you want, the first thing it finds with value it will output as such, if it doesn't, give it a 0 instead. (strategy is to do all the logic here vs in JS!!)
    SUM(votes.vote)/timestampdiff(DAY, posts.createdAt, now()) as hotnessScore,
    SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
    SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
FROM subreddits
LEFT JOIN posts ON subreddits.id = posts.subredditId
LEFT JOIN users ON posts.userId = users.id
LEFT JOIN votes ON posts.id = votes.postId --had to change this because it was aggregating all the user votes to each postId, and making that look all the votes for that postId when it was actually the total votes of each user
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
  COALESCE(SUM(votes.vote), 0) AS voteScore,
  SUM(votes.vote)/timestampdiff(DAY, posts.createdAt, now()) as hotnessScore,
  SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
  SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
FROM subreddits
LEFT JOIN posts ON subreddits.id = posts.subredditId
LEFT JOIN users ON posts.userId = users.id
LEFT JOIN votes ON posts.id = votes.postId
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
  COALESCE(SUM(votes.vote), 0) AS voteScore,
  SUM(votes.vote)/timestampdiff(DAY, posts.createdAt, now()) as hotnessScore,
  SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
  SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
FROM subreddits
LEFT JOIN posts ON subreddits.id = posts.subredditId
LEFT JOIN users ON posts.userId = users.id
LEFT JOIN votes ON posts.id = votes.postId
GROUP BY posts.id
ORDER BY hotnessScore DESC\G

--sort by CONTROVERSIAL
--Controversial ranking: = numUpvotes < numDownvotes ? totalVotes * (numUpvotes / numDownvotes) : totalVotes * (numDownvotes / numUpvotes)
SELECT
  *,
  ROUND( LEAST(upVotes, downVotes)/(upVotes - downVotes)^2, 2) AS controversialRating
FROM
  (SELECT 
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
    COALESCE(SUM(votes.vote), 0) AS voteScore,
    ROUND( SUM(votes.vote)/timestampdiff(DAY, posts.createdAt, now()) , 2) as hotnessScore,
    SUM( if(votes.vote = 1, 1, 0)) AS upVotes,
    SUM( if(votes.vote = -1, 1, 0) ) AS downVotes
  FROM subreddits
  LEFT JOIN posts ON subreddits.id = posts.subredditId
  LEFT JOIN users ON posts.userId = users.id
  LEFT JOIN votes ON posts.id = votes.postId
  GROUP BY posts.id)tbl
ORDER BY controversialRating DESC
LIMIT 2 OFFSET 0\G


