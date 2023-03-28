const { Sequelize, DataTypes } = require("sequelize");

// user_responses_reduced.js
module.exports = (sequelize) => {
    const User_responses_reduced = sequelize.define('user_responses_reduced', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Questions',
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
          model: 'Applications',
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
    }, {
      tableName: 'user_responses_reduced',
      timestamps: false,
      defaultScope: {
        attributes: {
          exclude: ['rn']
        },
        where: {
          rn: 1
        }
      }
    });
  
    return User_responses_reduced;
  };
  