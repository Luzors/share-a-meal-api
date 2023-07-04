const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller');

// UC-101 Inloggen toevoegen
router.post('/', loginController.logIn);

module.exports = router;