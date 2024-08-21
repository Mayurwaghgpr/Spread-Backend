import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';

const PostContent = Database.define('PostContent', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.TEXT,
    },
    Content: {
        type: DataTypes.TEXT,
        allowNull:false
    },
    index: {
        type: DataTypes.INTEGER,
        allowNull:false
    },
      postId: {
        type: DataTypes.UUID,
        allowNull:false
    }
})
export default PostContent

