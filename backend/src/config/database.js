const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelizeOptions = config.db.url
  ? { dialect: 'postgres', logging: false }
  : {
      dialect: 'postgres',
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      username: config.db.user,
      password: config.db.password,
      logging: false,
    };

const sequelize = config.db.url
  ? new Sequelize(config.db.url, sequelizeOptions)
  : new Sequelize(sequelizeOptions);

module.exports = sequelize;
