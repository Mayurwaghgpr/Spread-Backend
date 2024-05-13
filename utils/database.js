import Sequelize from "sequelize";

const Database = new Sequelize('Blogdatabase', 'postgres', 'mayur@619', {
    host: 'localhost',
    dialect: 'postgres'
});

export default Database