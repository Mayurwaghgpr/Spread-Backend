import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const AccessAndRefreshTokenGenerator = (user) => {
    try {
        // Select only the necessary user data for the token payload
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
        };

        const AccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        });

        const RefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        });

        return { AccessToken, RefreshToken };
    } catch (error) {
        console.error('Error generating tokens:', error);
        return null;
    }
};

export default AccessAndRefreshTokenGenerator;
