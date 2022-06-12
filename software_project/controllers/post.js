const mysql = require('mysql');
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
require("dotenv").config();
var nodemailer = require('nodemailer');


const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'influencerblog'
});

exports.newPost =async (req , res) => {
    console.log(req.body);
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    const {content} = req.body;
    db.query('INSERT INTO posts SET ?', {content: content,username:[decoded.username]},(error,results) => {
      if (error) {
        console.log(error);
      }
      else{
        console.log(results);
        return res.redirect('/home')
      }
    });
}

exports.newAdminPost =async (req , res) => {
    console.log(req.body);
    const username = "admin";
    const {content} = req.body;
    db.query('INSERT INTO posts SET ?', {content: content,username:username},(error,results) => {
        if (error) {
            console.log(error);
        }
        else{
            console.log(results);
            return res.redirect('/adminpass=123456')
        }
    });
}

exports.getPostByUser =  (req , res) => {

    db.query('SELECT * FROM posts ORDER BY id desc ', (error,results) => {
      if (error) {
        console.log(error);
      } else {
        console.log(results);
        return res.render('home',results)
      }
    });
}

exports.getPostByCategory = (req , res) => {
    console.log(req.params.category);

    db.query('SELECT * FROM posts WHERE community_id = ? ', [req.params.category],(error,results) => {
      if (error) {
        console.log(error);
      }else if(results.length <= 0){
        return res.render('home',{
          msg: 'No Posts Found!'
        })
      } else {
        console.log(results);
        return res.render('home',{
          msg: 'Return Posts!'
        })
      }
    });
}

exports.newComment =async  (req , res) => {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    const {text,postId} = req.body;
    db.query('INSERT INTO comments SET ?', {text: text,userId:[decoded.id],postId:postId},(error,results) => {
        if (error) {
            console.log(error);
        }
        else{
            console.log(results);
            return res.redirect('/home')
        }
    });
}

exports.getComments =async  (req , res) => {
    const {postId} = req.body;
    db.query('SELECT * FROM comments WHERE postId = ?', {postId},(error,results) => {
        if (error) {
            console.log(error);
        }
        else{
            console.log(results);
            return res.render('/home',{
               results : results
            });
        }
    });
}

exports.delCust = (req , res) => {
    const {id} = req.body;
    db.query('DELETE FROM accounts WHERE id = ?', {id});
}


exports.sendMsg = (req , res) => {

    const {email,msg} = req.body;
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'slavefocussss@gmail.com',
            pass: 'lalafocus4474'
        }
    });

    let mailOptions = {
        from: email,
        to: 'baraaalix17@gmail.com',
        subject: 'Sending Email using Node.js',
        text: msg
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect('/home')
        }
    });
}

