const database = require('../util/mysql-db');
const assert = require('assert');
const logger = require('../util/utils').logger;

function emailChecker(email) {
  // Regular expression pattern for email validation
  const emailPattern = /^[a-zA-Z]\.[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/;


  // Test if the email matches the pattern
  const isValidEmail = emailPattern.test(email);

  return isValidEmail;
}

const userController = {
  getAllUsers: async (req, res, next) => {
    try {
      logger.info('Get all users');

      const statusCode = 200;
      const users = await database.exQuery('SELECT * FROM user');

      console.log(statusCode); // Check the value of statusCode

      if (typeof statusCode !== 'undefined') {
        res.status(statusCode).json({
          status: statusCode,
          message: 'User getAll endpoint',
          data: users
        });
      } else {
         res.status(500).send('Internal Server Error');
      }
    } catch (error) {
      // Handle any errors that occurred during the query or processing
      console.error('Error getting users:', error);
      res.status(500).send('Internal Server Error');
    }
  },
  postUser: async (req, res, next) => {
    if(!emailChecker(req.body.emailAdress)){
      console.log('Empty or invalid email');
      return res.status(401).json({ message: 'Empty or invalid email' });
}
    try {
      logger.info('Post user');

      const { firstName, lastName, emailAdress, password, street, city } = req.body;
      logger.info(req.body);
      
      const query = `INSERT INTO user (firstName, lastName, emailAdress, password, street, city) VALUES ('${firstName}', '${lastName}', '${emailAdress}', '${password}', '${street}', '${city}')`;

      await database.exQuery(query);

      const statusCode = 200;

      console.log(statusCode); // Check the value of statusCode

      if (typeof statusCode !== 'undefined') {
        res.status(statusCode).json({
          status: statusCode,
          message: 'Posted user to database',
          data: ''
        });
      } else {
        res.status(500).send('Internal Server Error');
      }
    } catch (error) {
      console.error('Error posting user:', error);
      res.status(500).send('Internal Server Error');
    }
  },
  deleteUser: async (req, res, next) => {
    logger.info("i am here")
      try {

        
      } catch (error) {
        
      }
  }
};

module.exports = userController;
