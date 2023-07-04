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

      const statusCode = 201;

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
  getUserProfile: (req, res) => {
    const userId = req.userId; // get user id from validated token
  
    logger.info(`Get user profile with id ${userId}`);
  
    let sqlStatement1 = 'SELECT * FROM `user` WHERE id = ?'; // get user details query
    let sqlStatement2 = 'SELECT * FROM `meal` WHERE id = ?'; // get meals made by user query
    
    pool.getConnection((err, conn) => {
      if (err) {
        logger.error(err.message);
        res.status(500).json({
          status: 500,
          message: 'Failed to connect to the database'
        });
        return;
      }
  
      conn.query(sqlStatement1, [userId], (err, results) => {
        if (err) {
          pool.releaseConnection(conn);
          logger.error(err.message);
          res.status(500).json({
            status: 500,
            message: 'Failed to get user'
          });
          return;
        }
  
        if (results.length > 0) {
          let user = results[0];
          conn.query(sqlStatement2, [userId], (err, results) => {
            pool.releaseConnection(conn);
            if (err) {
              logger.error(err.message);
              res.status(500).json({
                status: 500,
                message: 'Failed to get meals'
              });
              return;
            }
  
            res.status(200).json({
              status: 200,
              message: `Loaded ${userId}`,
              data: {
                user: user,
                meals: results
              }
            });
          });
        } else {
          pool.releaseConnection(conn);
          res.status(404).json({
            status: 404,
            message: `User with id ${userId} not found`,
            data: {}
          });
        }
      });
    });
  },
  deleteUser: async (req, res, next) => {
    logger.info("Deleting user")
      try {
        const tokenId = req.body.id;
        const isDeleted = await database.exQuery(`DELETE FROM user WHERE id = '${tokenId}';`)
        console.log(isDeleted);
        if(isDeleted.affectedRows > 0){
          console.log("Delete succesfull")
          res.status(200).json({
            status: 200,
            message: 'Deleted user from database',
            data: ''
          });
        } else {
          console.log("No rows affected")
        }
        
      } catch (error) {
        console.error('An error has occured whilst deleting.')
        res.status(500).send('Could not delete user');
      }
  }
};

module.exports = userController;
