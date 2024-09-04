 import { DataTypes } from 'sequelize';

import Database from '../utils/database.js';


const Follow = Database.define('Follow', {
    followerId: DataTypes.UUID,
    followedId: DataTypes.UUID,
});
  
export default Follow