import express from 'express';
import {
  EditUserProfile,
  getUserPostsById,
  getUserProfile,
  FollowUser,
  getFollowers,
  getFollowing,
  Unfollow,
  AddPostToArchive,
  getArchivedPosts,
  removeFromArchive,
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
router.post('/unfollow', IsAuth, Unfollow);

// Put Routes
router.put('/follow', IsAuth, FollowUser);
router.put('/archive', IsAuth, AddPostToArchive); // Changed route to 'archive' for consistency

//Delete Routes
router.delete('/removeFromArchive',IsAuth,removeFromArchive)

export default router;
