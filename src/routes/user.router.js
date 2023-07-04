const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateTokenAndPassUser } = require('../util/auth')

// UC-201 Registreren als nieuwe user
router.post('/', userController.postUser);

// UC-202 Opvragen van overzicht van users
router.get('/', authenticateTokenAndPassUser, userController.getAllUsers);

// UC-203 Opvragen van gebruikersprofiel
router.get('/profile', authenticateTokenAndPassUser ,userController.getUserProfile);

// UC-206 Verwijderen van user
router.delete('/', authenticateTokenAndPassUser, userController.deleteUser);

module.exports = router;
