import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config()
const Isauth = (req, res, next) => {
    const Authorization = req.get('Authorization')
    // console.log(Authorization)
    if (!Authorization) {
        const error = new Error('UnAuthorize Access , Access denied!')
        error.statusCode = 401;
        throw(error)
    }
        const token = Authorization.split(' ')[1];
        let decodeToken;
        try {
            decodeToken = jwt.verify(token, process.env.SECRET)
        } catch (err) {
            console.log("server error")
            err.statusCode = 500
            throw (err)
        }
        if (!decodeToken) {
            console.log(decodeToken)
            const error = new Error('UnAuthorize Access , Access denied!')
            error.statusCode = 401;
            throw (error)
        }
    
        req.userId = decodeToken.id;
        next()
 }

 export default Isauth