import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const Isauth = (req, res, next) => {
    const Authorization = req.cookies.AccessToken || req.header("Authorization")?.replace("Bearer ", "");
    // console.log(req.cookies);
 console.log(req.Cookies)
    if (!Authorization) {
        const error = new Error('Unauthorized Access, Access denied!');
        error.statusCode = 401;
        return next(error);
    }

    const token = Authorization;
    let decodeToken;
   
    try {

        decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (decodeToken.exp * 1000 < Date.now()) {
            res.clearCookie('AccessToken');
            return res.status(401).json({ message: 'Access token has expired' });
        }
    } catch (err) {
        if (err.message === 'jwt expired') {
            res.clearCookie('AccessToken');
            return res.status(401).json({ message: 'Access token has expired' });
        } else {
            return next(err);
        }
    }

    if (!decodeToken) {
        const error = new Error('Unauthorized Access, Access denied!');
        error.statusCode = 401;
        return next(error);
    }

    // console.log('success');
    req.userId = decodeToken.id;
    next();
};

export default Isauth;
