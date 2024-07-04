import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config()
const Isauth = (req, res, next) => {
    const Authorization = req.cookies.token;
    let decodeToken;
    console.log('cookie',Authorization)
    if (!Authorization) {
        const error = new Error('UnAuthorize Access , Access denied!')
        error.statusCode = 401;
        throw(error)
    }
        const token = Authorization
      
        try {
            decodeToken = jwt.verify(token, process.env.SECRET)
              console.log(decodeToken)
            if (decoded.exp * 1000 < Date.now()) {
                    res.clearCookie('token');
                return res.status(401).json({message: 'access token has expired'})
            }
        } catch (err) {
          
            if (err.message === 'jwt expired') {
                 res.clearCookie('token');
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