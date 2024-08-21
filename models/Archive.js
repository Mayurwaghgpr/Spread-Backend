import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';


const Archive = Database.define('Archive', {
   PostId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
   UserId: {
        type: DataTypes.UUID,
        allowNull:false
    }
})

export default Archive