'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { User, Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');
// const auth = require('basic-auth');

// Construct a router instance.
const router = express.Router();

// ****************************************************************************
// Two simple helper functions to make error handling a bit less messy:
function handleSQLErrorOrRethrow(error) {
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    const errors = error.errors.map(err => err.message);
    res.status(400).json({ errors });   
  } else {
    throw error;
  }
}

function throwError(statusCode, message) {
  const error = new Error(message);  
  error.status = statusCode; // http status code
  throw error;               // let the error handler below handle it further 
}
// ****************************************************************************

// Route that returns the currently authenticated user
router.get('/users', authenticateUser, asyncHandler( async (req, res) => {
  try {
    const user = req.currentUser;
    if(user) {
      // console.log('req.currentUser: ', req.currentUser);
      res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress
      });  
    } else {
      throwError(401, 'Authorization failed');
    } 
  } catch(error) {
    handleSQLErrorOrRethrow(error);
  }
}));

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
  try {
    await User.create(req.body);
    res.location('/').status(201).end();
  } catch (error) {
    handleSQLErrorOrRethrow(error);
    // if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    //   const errors = error.errors.map(err => err.message);
    //   res.status(400).json({ errors });   
    // } else {
    //   throw error;
    // }
  }
}));

// return all courses including the User associated with each course 
// and a 200 HTTP status code.
router.get('/courses', asyncHandler( async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: 'courseUser'
        }
      ]
    });  
    res.status(200).json(courses);
  } catch(error) {
    handleSQLErrorOrRethrow(error);
    // if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    //   const errors = error.errors.map(err => err.message);
    //   res.status(400).json({ errors });   
    // } else {
    //   throw error;
    // }
  }
}));

// return the corresponding course including the User associated with 
// that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler( async (req, res) => {
  try {
    const course = await Course.findAll({
      where: {
        id: req.params.id
      },
      include: [
        {
          model: User,
          as: 'courseUser'
        }
      ]
    });  
    res.status(200).json(course);
  } catch(error) {
    handleSQLErrorOrRethrow(error);
    // if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    //   const errors = error.errors.map(err => err.message);
    //   res.status(400).json({ errors });   
    // } else {
    //   throw error;
    // }
  }
}));

// create a new course, set the Location header to the URI for the 
// newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', authenticateUser, asyncHandler( async (req, res) => {
  try {
    const user = await User.findByPk(req.currentUser.id);
    if (user) {
      req.body.userId = user.id;
      const course = await Course.create(req.body);
      res.location(`/courses/${course.id}`).status(201).end(); 
    } else {
      throwError(401, 'Authentication error creating course');
      // const error = new Error('Authentication error creating course');  
      // error.status = 401; // http 401 == unauthorized
      // throw error;        // let the error handler below handle it further 
    }

  } catch(error) {
    handleSQLErrorOrRethrow(error);
    // if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    //   const errors = error.errors.map(err => err.message);
    //   res.status(400).json({ errors });   
    // } else {
    //   throw error;
    // }
  }  
}));

// update the corresponding course and 
// return a 204 HTTP status code and no content.  
router.put('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  try {
    const user = await User.findByPk(req.currentUser.id);
    if (user) {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        if (course.userId === user.id) {
          req.body.userId = user.id;
          await course.update(req.body);    
          res.status(204).end();  
        } else { // this authorized user is not authorized to update this course (it's not his course)
          throwError(403, 'The course you are trying to update does not belong to you.🤷‍♂️');
          // const error = new Error('The course you are trying to update does not belong to you.🤷‍♂️');
          // error.status = 403; // http 403 == forbidden
          // throw error;        // let the error handler below handle it further                 
        }
      } else {
        throwError(404, 'The course you are trying to update does not exist anymore.🤷‍♂️');
        // const error = new Error('The course you are trying to update does not exist anymore.🤷‍♂️');
        // error.status = 404; // http 404 == not found
        // throw error;        // let the error handler below handle it further    
      }  
    } else { // user specified in auth header was not found
      throwError(401, 'Authorization failed');
      // const error = new Error('Authorization failed');
      // error.status = 401; // http 401 == unauthorized 
      // throw error;        // let the error handler below handle it further    
    }
  } catch(error) {
    handleSQLErrorOrRethrow(error);
    // if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    //   const errors = error.errors.map(err => err.message);
    //   res.status(error.status || 400).json({ errors });   
    // } else {
    //   throw error;
    // }
  }
}));

// A /api/courses/:id DELETE route that will delete the corresponding 
// course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  try {
    const user = await User.findByPk(req.currentUser.id);
    if (user) {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        if (course.userId === user.id) {
          await course.destroy();
          res.status(204).end();
        } else { // this authorized user is not authorized to delete this course (it's not his course)
          throwError(403, 'The course you are trying to delete does not belong to you.🤷‍♂️');
          // const error = new Error('The course you are trying to delete does not belong to you.🤷‍♂️');
          // error.status = 403; // http 403 == forbidden
          // throw error;        // let the error handler below handle it further                 
        }
      } else {
        throwError(404, 'The course you are trying to delete does not exist anymore.🤷‍♂️');
        // const error = new Error('The course you are trying to delete does not exist anymore.🤷‍♂️');
        // error.status = 404; // http 404 == not found
        // throw error;        // let the error handler below handle it further    
      }  
    } else { // user specified in auth header was not found
      throwError(401, 'Authorization failed');
      // const error = new Error('Authorization failed');
      // error.status = 401; // http 401 == unauthorized 
      // throw error;        // let the error handler below handle it further    
    }

    // const course = await Course.findByPk(req.params.id);
    // if(course) {
    //   await course.destroy();
    //   res.status(204).end();
    // } else {
    //   throwError(404, 'The course you are trying to delete does not exist anymore.🤷‍♂️');
    //   // const error = new Error('The course you are trying to delete does not exist anymore.🤷‍♂️');
    //   // error.status = 404; // http 404 == not found
    //   // throw error;        // let the error handler below handle it further    
    // }  
  } catch(error) {
    handleSQLErrorOrRethrow(error);
    // if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    //   const errors = error.errors.map(err => err.message);
    //   res.status(400).json({ errors });   
    // } else {
    //   throw error;
    // }
  }
}));
  
module.exports = router;