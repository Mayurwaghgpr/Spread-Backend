import express from 'express';
import { 
  userPrepsData, 
  searchData, 
  FollowUser,
  AddPostToArchive,
  removeFromArchive,
  LikePost,
} from '../controllers/public.js';
import IsAuth from '../middlewares/isAuth.js'; // Import the authentication middleware

const router = express.Router();

// Route to get preparation data for posts (authenticated users only)
router.get('/prepsdata', IsAuth, userPrepsData);


// Route to search for posts based on query parameters (authenticated users only)
router.get("/search", IsAuth, searchData);


// Put Routes
router.put('/like/',IsAuth,LikePost)
router.put('/follow', IsAuth, FollowUser);
router.put('/archive', IsAuth, AddPostToArchive);// Changed route to 'archive' for consistency


//Delete Routes
router.delete('/archive',IsAuth,removeFromArchive)

export default router;
