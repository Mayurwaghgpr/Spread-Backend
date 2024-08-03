import express from 'express';
import { EditUserProfile, getUserPostsById, getUserProfile ,FollowUser, getFollowers, getFollowing, Unfollow, AddPostToArchive, getArchivedPosts} from '../controllers/user.js';
import IsAuth from '../middlewares/isAuth.js';

const router = express.Router();
router.get('/logedInuser',IsAuth,getUserProfile)
router.get('/profile/:id', IsAuth, getUserProfile)
router.get('/userData/:userId', IsAuth, getUserPostsById)
router.get('/followers/:userId', IsAuth,getFollowers)
router.get('/following/:userId', IsAuth, getFollowing)
router.get('/ArchivedPost', IsAuth, getArchivedPosts)

router.post('/EditProfile', IsAuth, EditUserProfile)
router.post('/unfollow', IsAuth, Unfollow)

router.put('/follow', IsAuth, FollowUser)
router.put('/Archive', IsAuth, AddPostToArchive)


export default router