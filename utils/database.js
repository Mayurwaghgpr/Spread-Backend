import Sequelize from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

const Database = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Necessary for Neon databases
    },
  },
});
export default Database