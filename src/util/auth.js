const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/config.json');
const database = require('./mysql-db');
const logger = require('../util/utils').logger;

async function authenticateTokenAndPassUser(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).send({ message: 'Unauthorized for action, missing authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized for action, missing token' });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, jwtSecret);
      logger.info('User token is valid');
    } catch (error) {
      return res.status(401).send({ message: 'Unauthorized for action, invalid token' });
    }

    const id = decodedToken.id;
    if (!id) {
      return res.status(401).send({ message: 'Unauthorized for action, invalid token' });
    }

    try {
      const results = await database.exQuery(`SELECT * FROM user WHERE id = ${id}`);
      const user = results[0];
      if (!user) {
        return res.status(401).send({ message: 'Unauthorized for action, invalid token' });
      }

      req.user = user;
      next(); // Call next() to proceed to the next middleware
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (e) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { authenticateTokenAndPassUser };
