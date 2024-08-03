 import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';


const Follow = Database.define('Follow', {
    followerId: DataTypes.INTEGER,
    followedId: DataTypes.INTEGER,
}, {});
  
export default Follow