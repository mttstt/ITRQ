const { Sequelize,DataTypes } = require("sequelize");

// questionnaire.js
module.exports = (sequelize) => {
    const Questionnaire = sequelize.define('questionnaire', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cmdb_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      campagn_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'campagnes',
          key: 'id'
        }
      },
      questionnaire_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
  
    return Questionnaire;
  };
  