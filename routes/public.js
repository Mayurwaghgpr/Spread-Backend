import express from 'express';
import { getPosts, getPostsById, AddNewPost, EditPost, DeletePost, userPrepsData ,searchData} from '../controllers/post.js';
import IsAuthe from '../middlewares/isAuth.js'
const router = express.Router();

router.get('/prepsdata', IsAuthe, userPrepsData)
router.get("/posts",IsAuthe,getPosts)
router.get("/search",IsAuthe,searchData)

export default router