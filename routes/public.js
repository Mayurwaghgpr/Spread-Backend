import express from 'express';
import { 
  getPosts, 
  userPrepsData, 
  searchData 
} from '../controllers/post.js';
import IsAuthe from '../middlewares/isAuth.js'; // Import the authentication middleware

const router = express.Router();

// Route to get preparation data for posts (authenticated users only)
router.get('/prepsdata', IsAuthe, userPrepsData);

// Route to get all posts (authenticated users only)
router.get("/posts", IsAuthe, getPosts);

// Route to search for posts based on query parameters (authenticated users only)
router.get("/search", IsAuthe, searchData);

export default router;
