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
    },
    imageUrl: {
        type: DataTypes.STRING,
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
});
export default imageUrls;