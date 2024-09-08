import { DataTypes } from "sequelize";
import Database from '../utils/database.js';
import User from "./user.js";
import Post from "./posts.js";

const Likes = Database.define('Like', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        defaultValue:'',
        allowNull: false,
    },
    likedBy: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    postId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});


Likes.belongsTo(Post, {as:'likedPost' ,foreignKey: 'postId', onDelete: 'CASCADE' });
Post.hasMany(Likes, { as:'Likes', foreignKey: 'postId' });

export default Likes;
