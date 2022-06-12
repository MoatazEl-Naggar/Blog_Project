const express = require('express');
const postController = require('./controllers/post.js');

const router = express.Router();
router.use('/static',express.static('static'));
router.use('/images', express.static('images'));


router.post('/newPost', postController.newPost)
router.post('/sendMsg', postController.sendMsg)
router.post('/newAdminPost', postController.newAdminPost)
router.post('/delCust', postController.delCust)
router.get('/post/category/:category', postController.getPostByCategory)
router.get('/post/user/:username', postController.getPostByUser)

module.exports = router;
