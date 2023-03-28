const { Sequelize, DataTypes } = require("sequelize");

// sessioni.js
module.exports = (sequelize) => {
    const Campagnes = sequelize.define('campagnes', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      campagn: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      current_campagn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
    
    return Campagnes;
  };
  