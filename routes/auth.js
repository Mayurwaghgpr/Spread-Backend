import express from 'express';
const router = express.Router();
import { SignUp, LogIn, Logout, RefreshToken } from '../controllers/auth.js';
import IsAuth from '../middlewares/isAuth.js';
import passport from 'passport';

// Route to handle user sign up
router.put('/SignUp', SignUp);

// Route to handle user login
router.post('/Login', LogIn);

// Route to handle token refresh
router.get('/refreshToken', RefreshToken);

// Route to handle user logout, requires authentication
router.post('/logout', IsAuth, Logout);

router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] ,session:false})
);

const CookieOptions = {
    httpOnly: true,
    secure: true,  // Set to false if not using HTTPS
};
router.get(
  '/google/callback',
  passport.authenticate('google',{ session: false }),
  (req, res) => {
    const { user, AccessToken, RefreshToken } = req.user;

    res
      .cookie('AccessToken', AccessToken, CookieOptions)
        .cookie('RefreshToken', RefreshToken, CookieOptions)
      .redirect('http://localhost:5173/')
  }
);

export default router;
