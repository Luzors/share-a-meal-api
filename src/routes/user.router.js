const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateTokenAndPassUser } = require('../util/auth')

router.get('/', userController.getAllUsers);
router.post('/', userController.postUser);
router.delete('/', authenticateTokenAndPassUser, userController.deleteUser);

module.exports = router;
