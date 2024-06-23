import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';

const Post = Database.define('post', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull:false
    },
    subtitelpagraph: {
        type: DataTypes.STRING,
        allowNull:false
    },
    titleImage: {
        type: DataTypes.STRING,
        allowNull:false
    },
    topic: {
        type: DataTypes.STRING,
        defaultValue:'general',
        allowNull:false
    },
    authorId: {
        type: DataTypes.UUID,
        allowNull:false
    }
})

export default Post