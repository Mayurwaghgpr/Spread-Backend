import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';

const imageUrls = Database.define('imageUrl', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull:false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull:false
    },
    index: {
        type: DataTypes.NUMBER,
        allowNull:false
    },
    postId: {
        type: DataTypes.UUID,
        allowNull:false
    }
});
export default imageUrls;