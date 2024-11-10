import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import AccessAndRefreshTokenGenerator from '../utils/AccessAndRefreshTokenGenerator.js';

dotenv.config();
const saltRounds = 10;

const CookieOptions = {
    httpOnly: true,
    secure: true,  // Dynamically set based on environment
    sameSite: 'none',
     domain: '.vercel.app',
};

export const googleAuth = async (req, res, next) => {
    const user = req.user;
    console.log(user)
    try {
        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator({
            id: user.id,
            email: user.email,
            name: user.username,
            image: user.userImage,
        });

        res
            .cookie('AccessToken', AccessToken, CookieOptions)
            .cookie('RefreshToken', RefreshToken, CookieOptions)
            .redirect(process.env.FRONT_END_URL);
    } catch (error) {
        next(error);
    }
};

export const gitHubAuth = async(req,res,next) => {
         const user = req.user;
    console.log(user)
    try {

        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator({
            id: user.id,
            email: user.email,
            name: user.username,
            image: user.userImage,
        });

        res.cookie('AccessToken', AccessToken, CookieOptions)
            .cookie('RefreshToken', RefreshToken, CookieOptions)
            .redirect(process.env.FRONT_END_URL);
    } catch (error) {
        next(error);
    }
}
