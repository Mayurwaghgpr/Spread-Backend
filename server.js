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
import BlogPost from "./models/posts.js";
import User from "./models/user.js";
// import io from "./socket.js";
// import Database from "./utils/database.js";
// import SequelizeStore from 'connect-session-sequelize'
import cookieParser from "cookie-parser";
import multer from "multer";


dotenv.config();
// const sessionStore=SequelizeStore(session.Store)
// const dbstore =new sessionStore({db:Database})
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// console.log('DB User:', process.env.USER);
// console.log('DB Name:', process.env.DATABASE);
// console.log('DB Password:', process.env.DATABASE_PASSWORD);
// console.log('DB Port:', process.env.PORT);

// const db = new pg.Client({
//   user: process.env.USER,
//   host: 'localhost',
//   database: process.env.DATABASE,
//   password: process.env.DATABASE_PASSWORD,
//   port: 5432,
// });

// db.connect().catch(err => {
//   console.error('Connection error:', err.stack);
// });
//  const SequelizeStore = require("connect-session-sequelize")(session.Store);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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

app.use(cors({origin:'http://localhost:5173',methods:["POST","GET","PUT","PATCH","DELETE"],credentials:true}));
app.use(express.json());
app.use(cookieParser())


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({storage:storage,fileFilter:fileFilter}).single('images'))
app.use('/images',express.static(path.join(__dirname,'images')))

// app.use(session({
//       secret:process.env.SECRET,
//       resave:false,
//       saveUninitialized:false,
//       store:dbstore,
// cookie: {
//     maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
//     secure: false, // Set to true in production if using HTTPS
//     httpOnly: true,
//     sameSite: 'strict',
//   },
// }))

User.hasMany(BlogPost, { foreignKey: 'authorId' });
BlogPost.belongsTo(User, { foreignKey: 'authorId' });

app.use(authrouter);
app.use(user)
app.use(Postsrouter);

app.use((error, req, res, next) => {
  console.log(error)
  const status = error.errorStatusCode || 500 ;
  const message = error.message;
  res.status(status).json({message:message})
})

sequelize.sync().then(result => {
  app.listen(port, () => {
      console.log(`API is running at http://localhost:${port}`);
    });
  // const soketio = io.init(server);
  // soketio.on('connection', socket => {
  //   console.log('client connected')
  // })
}).catch(err => {
  console.log(err);
});
