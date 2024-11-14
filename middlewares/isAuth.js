import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to check if the user is authenticated
const IsAuth = (req, res, next) => {
    // Get the authorization token from cookies or headers
    const Authorization = req.cookies.AccessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log(req.cookies.AccessToken )
    // If no token is provided, send an unauthorized error
    if (!Authorization) {
        const error = new Error('Unauthorized Access, Access denied!');
        console.log('Unauthorized Access, Access denied!')
        error.statusCode = 401;
        return next(error);
    }

    const token = Authorization;
    let decodeToken;
   
    try {
        // Verify the token using the secret key from environment variables
        decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check if the token has expired
        if (decodeToken.exp * 1000 < Date.now()) {
            res.clearCookie('AccessToken'); // Clear expired token from cookies
            return res.status(401).json({ message: 'Access token has expired' });
        }
    } catch (err) {
        // Handle errors related to token verification
        if (err.message === 'jwt expired') {
            res.clearCookie('AccessToken'); // Clear expired token from cookies
            return res.status(401).json({ message: 'Access token has expired' });
        } else {
            // Pass other errors to the error handler
            return next(err);
        }
    }

    // If token is not decoded, return unauthorized error
    if (!decodeToken) {
        const error = new Error('Unauthorized Access, Access denied!');
        error.statusCode = 401;
        return next(error);
    }

    // Attach user ID from token to request object for further use
    req.authUser = decodeToken;
    next(); // Proceed to the next middleware or route handler
};

export default IsAuth;
