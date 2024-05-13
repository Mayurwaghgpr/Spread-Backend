import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';


const BlogPost = Database.define('BlogPost', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    authorId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'General'
    },
});

export default BlogPost