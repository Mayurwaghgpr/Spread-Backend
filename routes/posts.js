import express from 'express';
import {body} from 'express-validator';
import { getPosts, getPostsById, AddNewPost, EditPost, DeletePost } from '../controllers/post.js';
import IsAuthe from '../middlewares/isAuth.js'
const router = express.Router();




router.get("/:id", IsAuthe, getPostsById)
router.post("/posts",IsAuthe,AddNewPost) 
router.patch("/:id",IsAuthe,EditPost)
router.delete("/:prodId",IsAuthe, DeletePost)

export default router