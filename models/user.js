import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';

const User = Database.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userImage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    userInfo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
    }

});

export default User;
