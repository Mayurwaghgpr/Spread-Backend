import express from 'express';
import { getPosts, getPostsById, AddNewPost, EditPost, DeletePost, publicUtilData } from '../controllers/post.js';
import IsAuthe from '../middlewares/isAuth.js'
const router = express.Router();

router.get('/utildata', IsAuthe, publicUtilData)
router.get("/posts",IsAuthe,getPosts)


export default router