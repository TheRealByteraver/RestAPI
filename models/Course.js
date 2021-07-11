'use strict';
const { Model, DataTypes } = require('sequelize');
// const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class Course extends Model {}
  Course.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A title is required'
        },
        notEmpty: {
          msg: 'Please provide a title'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A description is required'
        },
        notEmpty: {
          msg: 'Please provide a description'
        }
      }
    },
    estimatedTime: {
      type: DataTypes.STRING,
      // allowNull: false,
      // validate: {
      //   notNull: {
      //     msg: 'An estimatedTime is required'
      //   },
      //   notEmpty: {
      //     msg: 'Please provide an estimatedTime'
      //   }
      // }
    },
    materialsNeeded: {
      type: DataTypes.STRING,
      // allowNull: false,
      // validate: {
      //   notNull: {
      //     msg: 'A materialsNeeded is required'
      //   },
      //   notEmpty: {
      //     msg: 'Please provide a materialsNeeded'
      //   }
      // }
    }
  }, { sequelize });

  Course.associate = (models) => {
    // one-to-one from User to Course: 
    // This tells Sequelize that a course can be associated 
    // with only one user. 
    Course.belongsTo(models.User, { 
      as: 'courseUser', // alias
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      }
    });
  };

  return Course;
};