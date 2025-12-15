'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  // --- PRODUCTION LOGIC FOR RENDER + AIVEN ---
  
  const databaseUrl = process.env[config.use_env_variable];
  
  const sequelizeConfig = {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        // THE FINAL FIX IS HERE:
        // We are telling the client to allow connections from servers
        // with self-signed certificates, which is what Aiven uses.
        rejectUnauthorized: false 
      }
    }
  };

  sequelize = new Sequelize(databaseUrl, sequelizeConfig);

} else {
  // --- DEVELOPMENT LOGIC for your local machine ---
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// ... (the rest of the file is exactly the same) ...

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;