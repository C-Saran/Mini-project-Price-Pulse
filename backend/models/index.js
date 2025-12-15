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
  // --- THIS IS THE PRODUCTION LOGIC (THE FIX IS HERE) ---
  
  // 1. Get the DATABASE_URL from the environment variables on Render
  const databaseUrl = process.env[config.use_env_variable];
  
  // 2. Create a configuration object
  const sequelizeConfig = {
    dialect: 'mysql',
    dialectOptions: {
      // 3. Add the SSL configuration required by Aiven
      ssl: {
        require: true,
        rejectUnauthorized: true
      }
    }
  };

  // 4. Initialize Sequelize with the URL and the new config object
  sequelize = new Sequelize(databaseUrl, sequelizeConfig);

} else {
  // This is the development logic for your local machine, it remains the same
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