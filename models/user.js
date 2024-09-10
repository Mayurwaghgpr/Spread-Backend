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
        defaultValue: "images/placeholderImages/ProfOutlook.png",
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    pronouns: {
          type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    signedWith: {
        type: DataTypes.STRING, 
    },
    bio:{
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
