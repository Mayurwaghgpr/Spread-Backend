import express from 'express';
const router = express.Router();
import { SignUp, SignIn, Logout, RefreshToken, forgotPass, resetPassword } from '../controllers/auth.js';
import IsAuth from '../middlewares/isAuth.js';
import passport from 'passport';
import { googleAuth } from '../controllers/mediaAuth.js';


// Route to initiate Google login
router.get(
  '/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false ,prompt: 'select_account'})
);

// Route to handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleAuth
);

// Route to handle token refresh
router.get('/refresh-token', RefreshToken);

// Route to handle user sign up
router.post('/signup', SignUp);

// Route to handle user login
router.post('/login', SignIn);

// Route to handle user logout, requires authentication
router.post('/logout', IsAuth, Logout);

router.post('/ForgotPassword',forgotPass)

//Route to handle reset password,
router.put('/ResetPassword/:token',resetPassword)



export default router;
