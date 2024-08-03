import express from "express";
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import authrouter from "./routes/auth.js";
import postsRouter from './routes/posts.js';
import userRouter from './routes/user.js';
import sequelize from './utils/database.js';
import Post from "./models/posts.js";
import User from "./models/user.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import imageUrls from "./models/ImageUrls.js";
import PostContent from "./models/PostContent.js";
import isAuth from "./middlewares/isAuth.js";
import { multerFileUpload } from "./middlewares/multer.middleware.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import publiRouter from "./routes/public.js"
import Follow from "./models/Follow.js";
import Archive from "./models/Archive.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Middleware
// app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

// Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);
// console.log(__dirname,'/images')
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images',express.static(path.join(__dirname,'images')));
app.use(multerFileUpload);


// Routes
app.use('/auth', authrouter);
app.use('/public',publiRouter)
app.use('/posts', postsRouter);
app.use('/user', userRouter);

// Associations

// User and Posts associations
User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(User, { foreignKey: 'authorId' });
Post.hasMany(imageUrls, { foreignKey: 'postId' });
imageUrls.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(PostContent, { foreignKey: 'postId' });
PostContent.belongsTo(Post, { foreignKey: 'postId' });

//User follower and following associations
User.belongsToMany(User, {
      through: 'Follow',
      as: 'Followers',
      foreignKey: 'followedId',
    });
    User.belongsToMany(User, {
      through: 'Follow',
      as: 'Following',
      foreignKey: 'followerId',
    });
Follow.belongsTo(User, { as: 'Follower', foreignKey: 'followerId' });
Follow.belongsTo(User, { as: 'Followed', foreignKey: 'followedId' });

// User and Post Archive association
User.hasMany(Archive, { foreignKey: 'ArchiveBelongsTo' })
Archive.belongsTo(User, { foreignKey: 'ArchiveBelongsTo' })


// Error Handling Middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message });
});

// Database Sync and Server Start
sequelize.sync()
  .then(result => {
    app.listen(port, () => {
      console.log(`API is running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });
