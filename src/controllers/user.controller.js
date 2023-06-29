const database = require('../util/mysql-db');
const assert = require('assert');
const logger = require('../util/utils').logger;

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
      // Handle any errors that occurred during the query or processing
      console.error('Error posting user:', error);
      res.status(500).send('Internal Server Error');
    }
  }
};

module.exports = userController;
