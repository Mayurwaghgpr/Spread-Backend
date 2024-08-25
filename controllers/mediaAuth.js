import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import AccessAndRefreshTokenGenerator from '../utils/AccessAndRefreshTokenGenerator.js';

dotenv.config();
const saltRounds = 10;

const CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Dynamically set based on environment
};

export const googleAuth = async (req, res, next) => {
    const profile = req.user;
    console.log(profile)
    try {
        let user = await User.findOne({ where: { email: profile.emails[0].value } });
        if (!user) {
            user = await User.create({
                username: profile.displayName,
                email: profile.emails[0].value,
                userImage: profile.photos[0].value,
                password:profile.id,
            });
        }

        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator({
            id: user.id,
            email: user.email,
            name: user.username,
            image: profile._json.picture,
        });

        res
            .cookie('AccessToken', AccessToken, CookieOptions)
            .cookie('RefreshToken', RefreshToken, CookieOptions)
            .redirect(process.env.FRONT_END_URL);
    } catch (error) {
        next(error);
    }
};
