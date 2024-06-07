import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config()
const Isauth = (req, res, next) => {
    // console.log(req.body)
    const Authorization = req.get('Authorization')
    console.log(Authorization)
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
            if (err.message === 'jwt expired') {
                 return res.status(401).json({message: 'access token has expired'})
            }
        }
        if (!decodeToken) {
            console.log(decodeToken)
            const error = new Error('UnAuthorize Access , Access denied!')
            error.statusCode = 401;
            throw (error)
        }
    console.log('sucess')
        req.userId = decodeToken.id;
        next()
 }

 export default Isauth