const { Sequelize, DataTypes } = require("sequelize");

// user_response.js
module.exports = (sequelize) => {
    const User_Responses = sequelize.define('user_responses', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id'
        }
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Question',
          key: 'id'
        }
      },
      question_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      cmdb_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Application',
          key: 'id'
        }
      },
      response: {
        type: DataTypes.INTEGER
      },
      notes: {
        type: DataTypes.STRING
      },
      campagn_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Campagnes',
          key: 'id'
        }
      },
      answered_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
  
    return user_responses;
  };
  