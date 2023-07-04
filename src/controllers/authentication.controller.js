const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/mysql-db');
const { logger, jwtSecretKey } = require('../util/utils');

module.exports = {
  /**
   * login
   * Retourneer een geldig token indien succesvol
   */
  login(req, res, next) {
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool');
        next({
          status: 500,
          message: err.status
        });
      }
      if (connection) {
        logger.trace('Database connection success');
  
        const sqlStatement = 'SELECT * FROM `user` WHERE `emailAdress` =?';
  
        connection.query(sqlStatement, [req.body.emailAdress], function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              status: 409,
              message: err.message
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            // If no user with the provided email exists
            if (results.length === 0) {
              res.status(404).json({
                status: 404,
                message: 'User does not exist'
              });
              return;
            }
            // If the password does not match
            else if (results.length === 1 && results[0].password !== req.body.password) {
              res.status(400).json({
                status: 400,
                message: 'Invalid password'
              });
              return;
            }
            // If the user is found and password matches
            else if (results.length === 1 && results[0].password === req.body.password) {
              const {password, id, ...userInfo} = results[0];
              const payload = {
                userId: id
              }
  
              jwt.sign(payload, 
                jwtSecretKey, 
                { expiresIn: '2d' }, 
                (err, token) => {
                  if (token) {
                    res.status(200).json({
                      status: 200,
                      message: 'Login endpoint',
                      data: {
                        id,
                        ...userInfo,
                        token
                      }
                    });
                  }
              })
            }
          }
        });
        connection.release();
      }
    });
  },
  
  /**
   * Validatie functie voor /api/login,
   * valideert of de vereiste body aanwezig is.
   */
  validateLogin(req, res, next) {
    // Verify that we receive the expected input
    try {
      assert(
        typeof req.body.emailAdress === 'string','emailAdress must be a string.');
      assert(
        typeof req.body.password === 'string','password must be a string.');
      next();
    } catch (err) {
      logger.warn(err.message.toString());
      res.status(400).json({
          status: 400,
          message: err.message.toString(),
      });
      return;
    }
  },

  /**
   * validateToken
   * Check the token of the authenticated user.
   */

  validateToken(req, res, next) {
    logger.trace('validateToken called');
  
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.trace('No authorization header');
      res.status(401).json({ 
        status: 401,
        message: 'No authorization header',
        data: undefined
      });
    } else {
      const token = authHeader.substring(7);
      logger.trace('token', token);
  
      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.trace('Not authorized');
          res.status(401).json({
            status: 401,
            message: 'Not authorized',
            data: undefined
          });
        } else {
          // Check if payload contains a valid userId
          if (payload && payload.userId) {
            req.userId = payload.userId;
            next();
          } else {
            logger.trace('Invalid token payload');
            res.status(401).json({
              status: 401,
              message: 'Invalid token payload',
              data: undefined
            });
          }
        }
      });
    }
  }

};
