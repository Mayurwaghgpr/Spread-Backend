import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';

const PostContent = Database.define('PostContent', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    Content: {
        type: DataTypes.STRING,
        allowNull:false
    },
      postId: {
        type: DataTypes.UUID,
        allowNull:false
    }
})