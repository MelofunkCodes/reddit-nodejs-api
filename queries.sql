--getAllPosts query

--original (all columns in posts table)
SELECT id, 
    title, 
    url, 
    userId, 
    createdAt, 
    updatedAt
FROM posts
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?

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
    users.updatedAt
FROM posts
    JOIN users ON posts.userId = users.id
    ORDER BY postCreatedAt DESC
    LIMIT ? OFFSET ?\G
    
    
--getAllPostsForUser query
SELECT 
    posts.id,
    posts.title,
    posts.url,
    posts.userId,
    users.username,
    posts.createdAt,
    posts.updatedAt
FROM users
    JOIN posts ON users.id = posts.userId
    WHERE users.id = ?
    LIMIT ? OFFSET ?\G
    
    
--getSinglePost query
SELECT 
    posts.id,
    posts.title,
    posts.url,
    posts.userId,
    users.username,
    posts.createdAt,
    posts.updatedAt
FROM users
    JOIN posts ON users.id = posts.userId
    WHERE posts.id = ?;