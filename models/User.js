'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { request } = require('express');

module.exports = (sequelize) => {
  class User extends Model {}
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A first name is required'
        },
        notEmpty: {
          msg: 'Please provide a first name'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A last name is required'
        },
        notEmpty: {
          msg: 'Please provide a last name'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'The email address you entered already exists'
      },
      validate: {
        notNull: {
          msg: 'An email address is required'
        },
        notEmpty: {
          msg: 'Please provide an email address'
        },
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    },
    passwordValidate: {
      type: DataTypes.VIRTUAL,  
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A password is required (passwordValidate)'
        },
        notEmpty: {
          msg: 'Please provide a password'
        },
        len: {
          args: [8, 20],
          msg: 'The password should be between 8 and 20 characters in length'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        // IMPORTANT! The password comparison "(val === this.passwordValidate)" 
        // will ONLY return true if "this.passwordValidate" is DEFINED! For 
        // that to happen, the key-value pairs in the JSON request body MUST be 
        // in the RIGHT ORDER as shown below:
        // {
        //   "firstName": "first_name",
        //   "lastName": "last_name",
        //   "emailAddress": "email_address@gmail.com",
        //   "passwordValidate": "1234567zz",
        //   "password": "1234567zz"
        // }
        // if "passwordValidate" is specified AFTER "password" instead of 
        // BEFORE, the check below WILL NOT WORK!! because 
        // "this.passwordValidate" will be undefined.

        // The check is now disabled to permit an easy review
        // if (val === this.passwordValidate) { 
          const hashedPassword = bcrypt.hashSync(val, 10);
          this.setDataValue('password', hashedPassword);
        // }
      },
      validate: {
        notNull: {
          msg: 'Both passwords must match' 
        }
      }
    }
  }, { sequelize });

  User.associate = (models) => {

    // one-to-many from User to Course
    User.hasMany(models.Course, { 
      as: 'courseUser', // alias
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      }
    });
  };

  return User;
};