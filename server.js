import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from 'pg';
import dotenv from 'dotenv'
import authrouter from "./routes/authe.js";
import Postsrouter from './routes/posts.js';
import sequelize from './utils/database.js';
import BlogPost from "./models/posts.js";
import User from "./models/user.js";

const port = process.env.PORT || 3000;
// dotenv.config();

// const port = process.env.PORT
// const db = new pg.Client({
//   user: process.env.USER,
//   host: 'localhost',
//   database: process.env.DATABASE,
//   password: process.env.DATABASE_PASSWORD,
//   post: 5432,
// })

// db.connect();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
User.hasMany(BlogPost, { foreignKey: 'authorId' });
BlogPost.belongsTo(User, { foreignKey: 'authorId' });
app.use(authrouter);
app.use(Postsrouter)

sequelize.sync().then(result => {
  app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
  });

}).catch(err => {
  console.log(err);
})
