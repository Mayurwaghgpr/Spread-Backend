import Sequelize from "sequelize";
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
// console.log(process.env.DATABASE_URL)

const Database = new Sequelize(process.env.DATABASE_URL, {

  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Necessary for Neon databases
    },
  },
});


export default Database