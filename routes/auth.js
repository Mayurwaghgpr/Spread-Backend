import express from 'express';
const router = express.Router();
import { SignUp,LogIn } from '../controllers/auth.js';


router.put('/Register',SignUp);

router.post('/Login',LogIn);

export default router;