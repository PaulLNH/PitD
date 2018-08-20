const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
    var Account = sequelize.define("Account", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      wins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      losses: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      kills: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      deaths: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      highscore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      gamesplayed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      timeplayed: {
        type: DataTypes.DECIMAL(5,2),
        defaultValue: 0.00
      },
      lastplayed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      deletedAt: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      // paranoid: true,
      hooks: {
        beforeCreate: (account) => {
          new Promise((resolve, reject) => {
            account.password = crypto.pbkdf2Sync(account.password, config.tokenSecret, 1000, 64, `sha512`).toString(`hex`);
  
            resolve(account);
          });
        }
      }
    });

    Account.prototype.validPassword = function(password) {
      return new Promise((resolve, reject) => {
        let hash = crypto.pbkdf2Sync(password, config.tokenSecret, 1000, 64, `sha512`).toString(`hex`);
        resolve((hash === this.password)? true : false);
      });
    };

    return Account;
  };
  