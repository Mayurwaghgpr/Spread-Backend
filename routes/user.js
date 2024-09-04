import express from 'express';
import {
  EditUserProfile,
  getUserPostsById,
  getUserProfile,
  getFollowers,
  getFollowing,
  getArchivedPosts,

} from '../controllers/user.js';
import IsAuth from '../middlewares/isAuth.js';

const router = express.Router();

// Get Routes
router.get('/loggedInUser', IsAuth, getUserProfile); // Changed route to 'loggedInUser' for clarity
router.get('/profile/:id', IsAuth, getUserProfile);
router.get('/userData/:userId', IsAuth, getUserPostsById);
router.get('/followers/:userId', IsAuth, getFollowers);
router.get('/following/:userId', IsAuth, getFollowing);
router.get('/archivedPosts', IsAuth, getArchivedPosts); // Changed route to 'archivedPosts' for consistency

// Post Routes
router.post('/editProfile', IsAuth, EditUserProfile);


export default router;
