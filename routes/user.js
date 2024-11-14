import express from 'express';
import {
  EditUserProfile,
  getUserPostsById,
  getUserProfile,
  getFollowers,
  getFollowing,
  getArchivedPosts,
  getLoginUser,

} from '../controllers/user.js';
import IsAuth from '../middlewares/isAuth.js';

const router = express.Router();

// Get Routes
router.get('/details', IsAuth, getLoginUser); 
router.get('/profile/:id', IsAuth, getUserProfile);
router.get('/posts/:userId', IsAuth, getUserPostsById);
router.get('/followers/:userId', IsAuth, getFollowers);
router.get('/following/:userId', IsAuth, getFollowing);
router.get('/posts/archived', IsAuth, getArchivedPosts); 

// Post Routes
router.post('/profile/edit', IsAuth, EditUserProfile);


export default router;
