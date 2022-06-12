const express = require('express');
const authController = require('./controllers/auth');

const router = express.Router();
router.use('/static',express.static('static'));
router.use('/images', express.static('images'));

router.post('/register', authController.register)
router.post('/login', authController.login)

router.get('/logout', authController.logout);

module.exports = router;