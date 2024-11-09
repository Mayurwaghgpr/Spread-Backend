import express from "express";
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import sequelize from './utils/database.js';
import authRouter from "./routes/auth.js";
import postsRouter from './routes/posts.js';
import userRouter from './routes/user.js';
import publiRouter from "./routes/public.js";
import { multerFileUpload } from "./middlewares/multer.middleware.js";
import Post from "./models/posts.js";
import User from "./models/user.js";
import Follow from "./models/Follow.js";
import Archive from "./models/Archive.js";
import {passportStrategies}  from "./utils/passportStartegies.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multerFileUpload);

//Login with google/gitub
passportStrategies(passport)

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/auth', authRouter);
app.use('/public', publiRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);

// Associations
User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(User, {  foreignKey: 'authorId' });



// User follower and following associations
User.belongsToMany(User, {
  through: Follow,
  as: 'Followers',
  foreignKey: 'followedId'
});
User.belongsToMany(User, {
  through: Follow,
  as: 'Following',
  foreignKey: 'followerId'
});
Follow.belongsTo(User, { as: 'Follower', foreignKey: 'followerId' });
Follow.belongsTo(User, { as: 'Followed', foreignKey: 'followedId' });

// User and Post Archive association
User.belongsToMany(Post, { through: Archive, as: 'SavedPosts', foreignKey: 'UserId' });
Post.belongsToMany(User, { through: Archive, as: 'UsersSaved', foreignKey: 'PostId' });
Archive.belongsTo(User, { as: 'User', foreignKey: 'UserId' });
Archive.belongsTo(Post, { as: 'Post', foreignKey: 'PostId' });


// Error Handling Middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  const status = error.statusCode || 500;
  const message = error.message || 'An error occurred';
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Database Sync and Server Start
sequelize.sync()
  .then(() => {
    // app.listen(port, () => {
    //   console.log(`API is running at http://localhost:${port}`);
    // });
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  });
export default app;