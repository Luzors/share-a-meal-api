const database = require('../util/mysql-db');
const assert = require('assert');
const logger = require('../util/utils').logger;
const jwt = require('jsonwebtoken');
const {jwtSecret} = require('../../config/config.json')

function emailChecker(email) {
    // Regular expression pattern for email validation
    const emailPattern = /^[a-zA-Z]\.[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/;

  
    // Test if the email matches the pattern
    const isValidEmail = emailPattern.test(email);
  
    return isValidEmail;
  }

const loginController = {
    logIn: async (req, res, next) => {
        let email = req.body.emailAdress;
        if(!email || !req.body.password || !emailChecker(email)){
                console.log('Empty email or password');
                return res.status(401).json({ message: 'Empty email or password' });
        }
      try {
        const { emailAdress, password } = req.body;
        let payload;
        let loggedIn = false;
        const results = await database.exQuery(`SELECT * FROM user WHERE emailAdress = '${emailAdress}' AND password = '${password}'`);

            if (results.length > 0) {
              const user = results[0];
              payload = {
                id: user.id,
                email: user.emailAdress
              };
              loggedIn = true;
            }
  
            if (loggedIn) {
              console.log('Login successful');
              const token = jwt.sign({ id: payload.id }, jwtSecret, { expiresIn: '24h' });
              return res.status(200).json({ 
                status: 200,
                message: "token recieved",
                data: token
                 });
            } else {
              console.log('Invalid email or password');
              return res.status(401).json({ message: 'Invalid email or password' });
            }

      } catch (err) {
        next(err);
      }
    }
  };
  
module.exports = loginController;
