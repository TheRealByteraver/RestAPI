'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

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
        console.log('val: ', val);                         // '12345678'
        console.log('firstName ---: ', this.firstName);    // 'first_name'
        console.log('lastName ----: ', this.lastName);     // 'last_name'
        console.log('emailAddress : ', this.emailAddress); // 'email_address@gmail.com'
        console.log('password ----: ', this.password);     // 'undefined' (expected)

        // The problem: this.passwordValidate is 'undefined' here, which is unexpected.
        // Expected value is '12345678'
        console.log('this.passwordValidate: ', this.passwordValidate); 

        // Even though req.body contains 'passwordValidate', it does not get passed 
        // to the Model.init() function (this function):
        console.log('this: ', this);
        /* Output:
        this:  User {
          dataValues: {
            id: null,
            firstName: 'first_name',
            lastName: 'last_name',
            emailAddress: 'email_address@gmail.com'
            // ??? where is 'passwordValidate' ???
          },
          _previousDataValues: {
            firstName: undefined,
            lastName: undefined,
            emailAddress: undefined
          },
          _changed: Set(3) { 'firstName', 'lastName', 'emailAddress' },
          _options: {
            isNewRecord: true,
            _schema: null,
            _schemaDelimiter: '',
            attributes: undefined,
            include: undefined,
            raw: undefined,
            silent: undefined
          },
          isNewRecord: true
        }
        */     

        // disabled this check because Model.create() will fail otherwise:
        // if ( val === this.passwordValidate ) { 
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
        fieldName: 'courseUserId',
        allowNull: false
      }
    });
  };

  return User;
};