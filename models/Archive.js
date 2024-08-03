import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';


const Archive = Database.define('Archive', {
     id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    PostIds: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ArchiveBelongsTo: {
        type: DataTypes.UUID,
        allowNull:false
    }
})

export default Archive