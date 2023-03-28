const { Sequelize, DataTypes } = require("sequelize");

// questions.js
module.exports = (sequelize) => {
    const Questions = sequelize.define('questions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      question_text: {
        type: DataTypes.STRING,
        allowNull: false
      },
      question_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      campagn_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Campagnes',
          key: 'id'
        }
      },
      questions_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
  
    return Questions;
  };
  