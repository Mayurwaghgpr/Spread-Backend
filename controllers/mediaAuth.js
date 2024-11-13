
import dotenv from 'dotenv';
import AccessAndRefreshTokenGenerator from '../utils/AccessAndRefreshTokenGenerator.js';

dotenv.config();

const CookieOptions = {
   httpOnly: true,      // Accessible only by the server
    secure: true,       // Not secure, since we're on HTTP on localhost
    sameSite: 'lax',
    domain:"https://spread-backend.vercel.app",
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
