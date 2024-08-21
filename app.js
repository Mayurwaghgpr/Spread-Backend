import express from "express";
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path';
import dotenv from 'dotenv';
import authRouter from "./routes/auth.js";
import postsRouter from './routes/posts.js';
import userRouter from './routes/user.js';
import publiRouter from "./routes/public.js";
import sequelize from './utils/database.js';
import Post from "./models/posts.js";
import User from "./models/user.js";
import cookieParser from "cookie-parser";
import { multerFileUpload } from "./middlewares/multer.middleware.js";
import imageUrls from "./models/ImageUrls.js";
import PostContent from "./models/PostContent.js";
import Follow from "./models/Follow.js";
import Archive from "./models/Archive.js";
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
import passport from "passport";
import {Strategy as GoogleStrategy }from"passport-google-oauth2"
import AccessAndRefreshTokenGenerator from "./utils/AccessAndRefreshTokenGenerator.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: ["http://localhost:3000","http://localhost:5173", "http://localhost:5174"],
  methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multerFileUpload);

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { email: profile.emails[0].value } });
        if (!user) {
          user = await User.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            userImage:profile.photos[0].value,
            password: '', // No password needed for OAuth
          });
        }

        const { AccessToken, RefreshToken } = AccessAndRefreshTokenGenerator({
          id: user.id,
          email: user.email,
          name: user.username,
          image: profile._json.picture,
        });

        done(null, { user, AccessToken, RefreshToken });
      } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
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
Post.belongsTo(User, { foreignKey: 'authorId' });
Post.hasMany(imageUrls, { foreignKey: 'postId' });
imageUrls.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(PostContent, { foreignKey: 'postId' });
PostContent.belongsTo(Post, { foreignKey: 'postId' });

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
  res.status(status).json({ message });
});



// Database Sync and Server Start
sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`API is running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });
