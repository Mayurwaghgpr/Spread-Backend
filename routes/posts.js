import express from 'express';
import { body } from 'express-validator';
import { getPosts, PostAllContent, AddNewPost, EditPost, DeletePost} from '../controllers/post.js';
import IsAuth from '../middlewares/isAuth.js';

const router = express.Router();

// Route to get all posts (authenticated users only)
router.get("/all", IsAuth, getPosts);

// Route to get a single post by ID
// Requires authentication middleware
router.get("/:id", IsAuth, PostAllContent);


// Route to add a new post
// Requires authentication middleware
router.post("/add", IsAuth, AddNewPost);    


// Route to edit an existing post by ID
// Requires authentication middleware
router.patch("/:id", IsAuth, EditPost);

// Route to delete a post by ID
// Requires authentication middleware
router.delete("/delete/:postId", IsAuth, DeletePost);



export default router;
