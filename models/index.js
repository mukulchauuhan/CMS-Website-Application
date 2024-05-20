// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('cms_db', 'root', 'Mukul@149489', {
    host: 'localhost',
    dialect: 'mysql'
});

// Check the database connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Initialize models
const Person = require('./person')(sequelize, DataTypes);

// Export sequelize and models
module.exports = {
    sequelize,
    Person
};
