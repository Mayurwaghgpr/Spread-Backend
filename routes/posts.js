import express from 'express';
import {body} from 'express-validator';
import { getPosts, getPostsById, AddNewPost, EditPost, DeletePost } from '../controllers/post.js';
import IsAuthe from '../middlewares/isAuth.js'
const router = express.Router();

// In-memory data store


router.get("/posts",IsAuthe, getPosts)
router.get("/:id",IsAuthe,getPostsById)
//CHALLENGE 3: POST a new post
router.post("/posts",IsAuthe,AddNewPost) 
//CHALLENGE 4: PATCH a post when you just want to update one parameter
router.patch("/:id",IsAuthe,EditPost)
//CHALLENGE 5: DELETE a specific post by providing the post id.
router.delete("/:prodId",IsAuthe, DeletePost)

export default router