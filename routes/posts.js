import express from 'express';
import { body } from 'express-validator';
import { getPosts, getPostsById, AddNewPost, EditPost, DeletePost } from '../controllers/post.js';
import IsAuthe from '../middlewares/isAuth.js';

const router = express.Router();

// Route to get a single post by ID
// Requires authentication middleware
router.get("/:id", IsAuthe, getPostsById);

// Route to add a new post
// Requires authentication middleware
// Use body validation to check the content of the request body
router.post("/posts", IsAuthe, AddNewPost);

// Route to edit an existing post by ID
// Requires authentication middleware
router.patch("/:id", IsAuthe, EditPost);

// Route to delete a post by ID
// Requires authentication middleware
router.delete("/:prodId", IsAuthe, DeletePost);

export default router;
