const pool = require('../util/mysql-db');
const logger = require('../util/utils').logger;
const assert = require('assert');


const userController = {
  getAllUsers: (req, res, next) => {
    logger.info('Get all users');
    
    
    // Initiate base SQL statement
    let sqlStatement = 'SELECT * FROM `user`';
    
    // Parameters for SQL query
    let sqlParams = [];
  
    // Check if there are query parameters and they don't exceed the maximum
    const queryFields = Object.entries(req.query);
    if (queryFields.length <= 2) {
      if (queryFields.length > 0) {
        sqlStatement += ' WHERE ';
        queryFields.forEach((field, index) => {
          if (index !== 0) {
            sqlStatement += ' AND ';
          }
          
          // Handle isActive field specifically
          if (field[0] === 'isActive') {
            if (field[1].toLowerCase() === 'true') {
              sqlStatement += `${field[0]} = ?`;
              sqlParams.push(1);
            } else if (field[1].toLowerCase() === 'false') {
              sqlStatement += `${field[0]} = ?`;
              sqlParams.push(0);
            } else {
              // handle error: isActive is not true or false
              res.status(400).json({
                status: 400,
                message: 'Invalid value for isActive. It should be either true or false.',
              });
              return;
            }
          } else {
            // For all other fields
            sqlStatement += `${field[0]} = ?`;
            sqlParams.push(field[1]);
          }
        });
      }
    } else {
      res.status(400).json({
        status: 400,
        message: 'Too many query parameters. Maximum is 2.',
      });
      return;
    }
  
    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.message);
        next({
          status: 500,
          message: 'Failed to connect to the database',
        });
      } else {
        conn.query(sqlStatement, sqlParams, function (err, results, fields) {
          pool.releaseConnection(conn);
          if (err) {
            logger.error(err.message);
            next({
              status: 500,
              message: 'Failed to retrieve user data',
            });
          } else if (results) {
            // Filter the results: replace the password with 'hidden' for all other users
            const authenticatedUserId = req.userId;  // Assuming you stored the authenticated user's ID here
            results.forEach(user => {
              if (user.id !== authenticatedUserId) {
                user.password = 'hidden';
              }
            });
            
            logger.info('Found', results.length, 'results');
            res.status(200).json({
              status: 200,
              message: 'User data endpoint',
              data: results,
            });
          }
        });
      }
    });
  },

  createUser: (req, res) => {
    logger.info('Register user');
  
    const user = req.body;
    logger.debug('user = ', user);
  
    try {
      // Validation
      assert(user.firstName && typeof user.firstName === 'string' && user.firstName.trim().length > 0 , 'Required field missing')
      assert(user.lastName && typeof user.lastName === 'string' && user.lastName.trim().length > 0 , 'Required field missing')

      // email address validation
      assert(typeof user.emailAdress === 'string' && user.emailAdress.trim().length > 0, 'emailAdress must be a string')
      assert(/^[a-zA-Z]\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/.test(user.emailAdress), 'emailAdress is not valid (e.example@test.nl)');

      // password validation
      assert(typeof user.password === 'string' && user.password.trim().length > 0, 'password must be a string')
      assert(user.password.length >= 8, 'password must be at least 8 characters long')
      assert(/[A-Z]/.test(user.password), 'password must contain at least one uppercase letter')
      assert(/[0-9]/.test(user.password), 'password must contain at least one number')

      // phoneNumber validation
      assert(typeof user.phoneNumber === 'string' && user.phoneNumber.trim().length > 0 , 'phoneNumber must be a string')
      assert(/^06[- ]?\d{8}$/.test(user.phoneNumber), 'phoneNumber is not valid');


  
      pool.query('SELECT * FROM `user` WHERE `emailAdress` = ?', [user.emailAdress], (err, result) => {
        if (err) {
          logger.error(err.message);
          res.status(500).json({ 
            status: 500, 
            message: 'Failed to search for emailAdress in the database' 
          });
          return;
        }   
  
        try {
          assert(result.length === 0, 'User already exists')
          const sqlStatement = 'INSERT INTO `user` SET ?'
          pool.getConnection((err, conn) => {
            if (err) {
              logger.error(err.message);
              res.status(500).json({ 
                status: 500, 
                message: 'Failed to connect to the database' 
              });
              return;
            }
  
            conn.query(sqlStatement, user, (err, result) => {
              if (err) {
                logger.error(err.message);
                res.status(500).json({ 
                  status: 500, 
                  message: 'Failed to insert user data into the database' ,
                  error: err.message
                });
                return;
              }
  
              user.id = result.insertId;
              logger.info('User registered successfully with ID:', result.insertId)
              res.status(201).json({ 
                status: 201, 
                message: 'Successfully registered user', 
                data: user 
              });
            })
            pool.releaseConnection(conn);
          });
        } catch (err) {
          logger.warn(err.message)
          res.status(403).json({
            status: 403,
            message: err.message 
          });
          return;
        }
      });
    } catch (err) {
      logger.warn(err.message)
      res.status(400).json({
        status: 400,
        message: err.message 
      });
      return;
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

  getUserById: (req, res) => {
    const userId = parseInt(req.params.userId);
    // Get authenticated user's ID
    const authenticatedUserId = Number(req.userId);
    let sqlStatement = 'SELECT * FROM `user` WHERE id = ?';
    pool.getConnection((err, conn) => {
      if (err) {
        logger.error(err.message);
        res.status(500).json({
          status: 500,
          message: 'Failed to connect to the database'
        });
        return;
      }

      conn.query(sqlStatement, [userId], (err, results) => {
        pool.releaseConnection(conn);
        if (err) {
          logger.error(err.message);
          res.status(500).json({
            status: 500,
            message: 'Failed to retrieve user'
          });
          return;
        }

        if (results.length > 0) {
          // Hide password if authenticated user is not the same as requested user
          if (results[0].id !== authenticatedUserId) {
            results[0].password = 'hidden';
          }
          res.status(200).json({
            status: 200,
            message: `User with id ${userId} found`,
            data: results[0]
          });
        } else {
          res.status(404).json({
            status: 404,
            message: `User with id ${userId} not found`,
            data: {}
          });
        }
      });
    });
  },

  updateUser: (req, res) => {
    const userId = parseInt(req.params.userId);
    const updatedUser = req.body;
    logger.info(`Update user with id ${userId}`);

    if (req.userId !== userId) {
      res.status(403).json({
        status: 403,
        message: 'You are not the owner of this account',
        data: {}
      });
      return;
    }

    if (!updatedUser.emailAdress) {
      res.status(400).json({
        status: 400,
        message: 'Required field "emailAdress" is missing'
      });
      return;
    }
       // Perform email validation checks
    try {
      assert(typeof updatedUser.emailAdress === 'string' && updatedUser.emailAdress.trim().length > 0, 'emailAdress must be a string');
      assert(/^[a-zA-Z]\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/.test(updatedUser.emailAdress), 'emailAdress is not valid (e.example@test.nl)');
    } catch (error) {
      res.status(400).json({
        status: 400,
        message: error.message
      });
      return;
    }

      // Perform phone number validation checks if phone number is being updated
  if (updatedUser.phoneNumber) {
    try {
      assert(typeof updatedUser.phoneNumber === 'string' && updatedUser.phoneNumber.trim().length > 0 , 'phoneNumber must be a string');
      assert(/^06[- ]?\d{8}$/.test(updatedUser.phoneNumber), 'phoneNumber is not valid');
    } catch (error) {
      res.status(400).json({
        status: 400,
        message: error.message
      });
      return;
    }
  }
    
    let sqlStatement = 'UPDATE `user` SET ? WHERE `id` = ?';
    pool.getConnection((err, conn) => {
      if (err) {
        logger.error(err.message);
        res.status(500).json({
          status: 500,
          message: 'Failed to connect to the database'
        });
        return;
      }
  
      conn.query(sqlStatement, [updatedUser, userId], (err, results) => {
        pool.releaseConnection(conn);
        if (err) {
          logger.error(err.message);
          res.status(500).json({
            status: 500,
            message: 'Failed to update user'
          });
          return;
        }
  
        if (results.affectedRows > 0) {
          res.status(200).json({
            status: 200,
            message: `User with id ${userId} has been updated`,
            data: updatedUser
          });
        } else {
          res.status(404).json({
            status: 404,
            message: `User with id ${userId} not found`,
            data: {}
          });
        }
      });
    });
  },

  deleteUser: (req, res) => {
    const userId = parseInt(req.params.userId);
    logger.info(`Delete user with id ${userId}`);

    if (req.userId !== userId) {
      res.status(403).json({
        status: 403,
        message: 'You are not the owner of this account',
        data: {}
      });
      return;
    }

    let sqlStatement = 'DELETE FROM `user` WHERE id = ?';
    pool.getConnection((err, conn) => {
      if (err) {
        logger.error(err.message);
        res.status(500).json({
          status: 500,
          message: 'Failed to connect to the database'
        });
        return;
      }

      conn.query(sqlStatement, [userId], (err, results) => {
        pool.releaseConnection(conn);
        if (err) {
          logger.error(err.message);
          res.status(500).json({
            status: 500,
            message: 'Failed to delete user'
          });
          return;
        }

        if (results.affectedRows > 0) {
          res.status(200).json({
            status: 200,
            message: `User with id ${userId} has been deleted`,
            data: {}
          });
        } else {
          res.status(404).json({
            status: 404,
            message: `User with id ${userId} not found`,
            data: {}
          });
        }
      });
    });
  }
};


module.exports = userController;