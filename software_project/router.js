const express = require('express');
const router = express.Router();
const authController = require('./controllers/auth');
const mysql = require('mysql');
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
require("dotenv").config();

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'influencerblog'
});

router.use('/static',express.static('static'));
router.use('/images', express.static('images'));

router.get('/',function (req ,res) {
    db.query('SELECT * FROM posts ORDER BY id desc ', (error,results) => {
        if (error) {
            console.log(error);
        } else {
            let categories;
            db.query('SELECT * FROM categories', (error,result) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(result);
                    categories = result;
                    return res.render('home',{
                        results: results,
                        categories: categories
                    });
                }
            });
        }
    });
});

router.get('/register',function (req ,res) {
    res.render('register');
});

router.get('/login',function (req ,res) {
    res.render('login');
});
router.get('/contact',function (req ,res) {
    res.render('contact');
});

router.get('/customers',function (req ,res) {
    db.query('SELECT *  FROM accounts', (error, accounts) => {
        if (error) {
            console.log(error);
        } else {
            return res.render('customers', {
                accounts : accounts
            });
        }
    });
});

router.get('/admin?pass=123456',function (req ,res) {
    db.query('SELECT * FROM posts ORDER BY id desc ', (error,results) => {
        if (error) {
            console.log(error);
        } else {
            let categories;
            db.query('SELECT * FROM categories', (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(result);
                    categories = result;
                    db.query('SELECT * FROM accounts', (error, accounts) => {
                        if (error) {
                            console.log(error);
                        } else {
                            db.query('SELECT MAX(likes+comments) AS max FROM posts', (error, max) => {
                                if (error) {
                                    console.log(error);
                                } else {
                                    let newMax = max[0].max;

                                    db.query('SELECT *  FROM posts', (error, posts) => {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            return res.render('admin', {
                                                results: results,
                                                accounts : accounts,
                                                categories: categories,
                                                maximum : newMax,
                                                posts : posts
                                            });
                                        }
                                    });
                                }

                            });
                        }

                    });

                }
            });
        }
});
});

router.get('/home',authController.isLoggedIn, async (req ,res) => {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    let username = decoded.username;
    let plan
    if(decoded.plan===2){
        plan = decoded.plan;
    }
    if(req.user){
        db.query('SELECT * FROM posts ORDER BY id desc ', (error,results) => {
            if (error) {
                console.log(error);
            } else {
                let categories;
                db.query('SELECT * FROM categories', (error,result) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(result);
                        categories = result;
                        return res.render('home',{
                            results: results,
                            categories: categories,
                            username: username,
                            plan: plan
                        });
                    }
                });
            }
        });
    }

});

router.get('/profile', authController.isLoggedIn,async (req ,res) => {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    let username = decoded.username;


        db.query('SELECT * FROM posts WHERE username = ? ORDER BY id desc',[username], (error,results) => {
            if (error) {
                console.log(error);
            } else {

               return res.render('profile',{
                    results: results,
                    username: username
               });
            }
        });

});

module.exports = router;