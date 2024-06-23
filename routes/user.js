import express from 'express';
import { getUserPostsById, getUserProfile } from '../controllers/user.js';
import Isauth from '../middlewares/isAuth.js';

const router = express.Router();

router.get('/profile/:id', Isauth, getUserProfile)
router.get('/profile/userData/:userId', Isauth,getUserPostsById)

export default router