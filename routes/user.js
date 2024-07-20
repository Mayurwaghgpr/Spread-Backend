import express from 'express';
import { EditUserProfile, getUserPostsById, getUserProfile } from '../controllers/user.js';
import Isauth from '../middlewares/isAuth.js';

const router = express.Router();

router.get('/profile/:id', Isauth, getUserProfile)
router.get('/userData/:userId', Isauth, getUserPostsById)
router.post('/EditProfile',Isauth,EditUserProfile)

export default router