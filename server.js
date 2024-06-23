import express from "express";
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path'
import pg from 'pg';
import dotenv from 'dotenv';
import authrouter from "./routes/auth.js";
import Postsrouter from './routes/posts.js';
import user from './routes/user.js';
import sequelize from './utils/database.js';
import Post from "./models/posts.js";
import User from "./models/user.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import imageUrls from "./models/ImageUrls.js";
import PostContent from "./models/PostContent.js";
import Isauth from "./middlewares/isAuth.js";


dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log('filer',file)
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
})
 const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null,true)
  } else {
    cb(null,false)
  }
 }

// Middleware
app.use(cors({origin:'http://localhost:5173',methods:["POST","GET","PUT","PATCH","DELETE"],credentials:true}));
app.use(express.json());
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(authrouter)
// app.use(IsAuth)
app.use(multer({storage:storage,fileFilter:fileFilter}).any())
app.use('/images',express.static(path.join(__dirname,'images')))

User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(User, { foreignKey: 'authorId' });
Post.hasMany(imageUrls, { foreignKey: 'postId' })
imageUrls.belongsTo(Post, { foreignKey: 'postId' })
Post.hasMany(PostContent, { foreignKey: 'postId' })
PostContent.belongsTo(Post,{ foreignKey: 'postId' })


app.use(user)
app.use('/posts',Postsrouter);

app.use((error, req, res, next) => {
  console.log(req)
  console.log('the error',error)
  const status = error.StatusCode || 500 ;
  const message = error.message;
  res.status(status).json({message:message})
})

sequelize.sync().then(result => {
  app.listen(port, () => {
      console.log(`API is running at http://localhost:${port}`);
    });
}).catch(err => {
  console.log(err);
});
