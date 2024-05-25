import express from 'express';
import { getUserprofile } from '../controllers/user.js';
import Isauth from '../middlewares/isAuth.js';

const router = express.Router();

router.get('/profile',Isauth, getUserprofile)

export default router