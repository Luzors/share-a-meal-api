const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticationController = require('../controllers/authentication.controller');

// Hier werk je de routes uit.
// UC-201 Registreren als nieuwe user
router.post('', userController.createUser);

// UC-202 Opvragen van overzicht van users
router.get('', authenticationController.validateToken , userController.getAllUsers);

// UC-203 Opvragen van gebruikersprofiel
router.get('/profile', authenticationController.validateToken ,userController.getUserProfile);

// UC-204 Opvragen van usergegevens bij ID
router.get('/:userId', authenticationController.validateToken , userController.getUserById);

// UC-205 Wijzigen van usergegevens
router.put('/:userId', authenticationController.validateToken ,userController.updateUser);

// UC-206 Verwijderen van user
router.delete('/:userId', authenticationController.validateToken , userController.deleteUser);


module.exports = router;
