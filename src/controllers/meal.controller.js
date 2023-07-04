const pool = require('../util/mysql-db');
const logger = require('../util/utils').logger;
const assert = require('assert');

const mealController = {
// UC-301 Toevoegen van nieuwe maaltijden
    createMeal: (req, res, next) => {
          logger.trace('Create new meal');
      
          // De mealgegevens zijn meegestuurd in de request body.
          const meal = req.body;
          const userId = req.userId;
          logger.trace('meal = ', meal);
      
          // Here you can see how to validate incoming meal info.
          try {
            logger.info('assert req body')
            assert(typeof meal.name === 'string', 'mealName must be a string');
            assert(typeof meal.description === 'string', 'description must be a string');
            assert(typeof meal.price === 'number', 'price must be a number');
            assert(typeof meal.dateTime === 'string', 'dateTime must be a string');
            assert(typeof meal.maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
            assert(typeof meal.imageUrl === 'string', 'imageUrl must be a string');
          } catch (err) {
            logger.warn(err.message.toString());
            res.status(400).json({
                status: 400,
                message: err.message.toString(),
            });
            return;
        }
      
          logger.trace('asserts completed')

          let date = new Date(meal.dateTime); 
          let mysqlDateTime = date.toISOString().slice(0, 19).replace('T', ' ');

      
          let sqlStatement = 
          'INSERT INTO `meal` (`name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
          "(?, ?, ?, ?, ?, ?, ?);" + 
            'SELECT * FROM `user` WHERE id=?;';
      
            pool.getConnection(function (err, conn) {
              if (err) {
                logger.error(err.message, err.status, err.syscall, err.address, err.port);
                next({
                  status: 500,
                  message: err.status,
                  error: err.message
                });
              }
              if (conn) {
                logger.trace('conn succesfull')
                conn.query(
                  sqlStatement,
                  [
                    meal.name,
                    meal.description,
                    meal.imageUrl,
                    mysqlDateTime,
                    meal.maxAmountOfParticipants,
                    meal.price,
                    userId,
                    meal.cookId
                  ], (err, results, fields) => {
                    if (err) {
                      logger.error(err.message);
                      next({
                        status: 409,
                        message: err.message
                      });
                    }
                    if (results) {
                      logger.trace('Meal successfully added, id = ', results.insertId);
                      const newMeal = {
                        id: results[0].insertId,
                        ...meal,
                        cook: results[1]
                      }
                      res.status(201).json({
                        status: 201,
                        message: 'New meal created',
                        data: newMeal
                      })
                    }
                  }
                )
              }
            })
      },
      
// UC-302 Wijzigen van maaltijd
    updateMeal: (req, res) => {
      },
    
// UC-303 Opvragen van alle maaltijden  
    getAllMeals: (req, res, next) => {
        logger.info('Get all meals');
        let sqlStatement = 'SELECT * FROM `meal`'
    
        pool.getConnection(function (err, conn) {
            if (err) {
              logger.error(err.message)
              next({
                status: 500,
                message: 'Failed to connect to the database' 
              })
            }
            if (conn) {
              conn.query(sqlStatement, function (err, results, fields) {
                if (err) {
                  logger.err(err.message)
                  next({
                    status: 500,
                    message: 'Failed to retrieve meal data'
                  })
                }
                if (results) {
                  logger.info('Found', results.length, 'results');
                  res.status(200).json({
                    status: 200,
                    message: 'Meal data endpoint',
                    data: results
                  })
                }
              })
              pool.releaseConnection(conn);
            }
        });
      },

// UC-304 Opvragen van maaltijd bij ID      
    getMealById: (req, res) => {
  const mealId = parseInt(req.params.mealId);
  let sqlStatement = 'SELECT * FROM `meal` WHERE id = ?';
  pool.getConnection((err, conn) => {
    if (err) {
      logger.error(err.message);
      res.status(500).json({
        status: 500,
        message: 'Failed to connect to the database'
      });
      return;
    }

    conn.query(sqlStatement, [mealId], (err, results) => {
      if (err) {
        logger.error(err.message);
        res.status(500).json({
          status: 500,
          message: 'Failed to retrieve meal'
        });
      } else {
        if (results.length > 0) {
          res.status(200).json({
            status: 200,
            message: `meal with id ${mealId} found`,
            data: results[0]
          });
        } else {
          res.status(404).json({
            status: 404,
            message: `meal with id ${mealId} not found`,
            data: {}
          });
        }
      }
      pool.releaseConnection(conn);  // Moved here
    });
  });
    },


// UC-305 Verwijderen van maaltijd
    deleteMeal: (req, res, next) => {
  const mealId = parseInt(req.params.mealId);
  const userId = req.userId; 

  const sqlStatement = 'SELECT * FROM `meal` WHERE `id`=?';

  pool.getConnection((err, conn) => {
    if (err) {
      logger.error(err.status, err.syscall, err.address, err.port);
      next({
        status: 500,
        message: err.status
      });
      return;
    }

    conn.query(sqlStatement, [mealId], (err, results) => {
      if (err) {
        logger.error(err.message);
        next({
          status: 500,
          message: err.message
        });
        return;
      }

      if (!results.length) {
        res.status(404).json({
          status: 404,
          message: "Meal does not exist"
        });
        return;
      }

      if (results[0].cookId !== userId) {
        res.status(403).json({
          status: 403,
          message: "You are not the owner of the meal"
        });
        return;
      }

      const sqlDelete = 'DELETE FROM `meal` WHERE `id`=?';

      conn.query(sqlDelete, [mealId], (err, result) => {
        if (err) {
          logger.error(err.message);
          next({
            status: 500,
            message: err.message
          });
          return;
        }

        res.status(200).json({
          status: 200,
          message: "Meal successfully deleted"
        });
      });
    });
  });
}};




module.exports = mealController;
