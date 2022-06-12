const mysql = require('mysql');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {promisify} = require('util')
require("dotenv").config();




const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'influencerblog'
});
exports.register = (req , res) => {
    console.log(req.body);

    const {name,email,password,passwordConfirm,plan} = req.body;
    db.query('SELECT email FROM accounts WHERE email = ?', [email],async (error,results)=>{
        if (error) {
            console.log(error);
        }

        if (results.length > 0){
            return res.render('register',{
                msg: 'That email is already in use!'
            })
        }else if (password !== passwordConfirm){
            return res.render('register',{
                msg: 'Password do not match!'
            });
        }
        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO accounts SET ?', {username: name, email: email, password: hashedPassword, plan:plan},(error,results) => {
            if (error) {
                console.log(error);
            }else{
                console.log(results)
                return res.render('login',{
                    msg: 'User Registered!'
                })
            }

        });
    });



}

exports.login = async (req , res) => {
    console.log(req.body);
    const {email,password} = req.body;

    db.query('SELECT * FROM accounts WHERE email = ?', [email], async (error,results)=>{
        if (error) {
            console.log(error);
        }
            try {
                if (!results || !(await bcrypt.compare(password , results[0].password)) ){
                    res.status(401).render('login',{
                        msg: 'Invalid email or password!'
                    })
                } else {
                    const id = results[0].id;
                    const username = results[0].username;
                    const plan = results[0].plan;

                    const token = jwt.sign({id,username,plan}, process.env.JWT_SECRET ,{
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });

                    const cookieOptions = {
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                        ),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookieOptions);
                    res.status(200).redirect("/home")
                }

            }catch (e) {
                console.log(e);
            }


    });


}

exports.isLoggedIn = async (req , res ,next) => {
    if(req.cookies.jwt){
        try{
          var dispComm;

            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            db.query('SELECT * FROM accounts WHERE id= ? ' ,[decoded.id] , (error , results) => {
              db.query('SELECT * FROM communities' , (error , results) => {
                if(results){

                  console.log(results);
                  dispComm = results;                }
              });
                if(!results){
                    return next();
                }
                console.log(results);

                req.user = Object.assign(results, dispComm);

                return next();
            });
        }catch (e) {
            console.log(e);
            return next();
        }
    } else {
        next();
    }


}

exports.logout = async (req , res ) => {
    res.cookie('jwt', 'logout',{
        expires: new Date(Date.now() + 2*1000),
        httpOnly: true
    });
    res.status(200).redirect('/');
}



// exports.likePost = async (req , res) => {
//     console.log(req.body);
//     const {user_id,post_id} = req.body;
//
//                 db.query('SELECT * FROM likes WHERE post_id= ?'),[post_id], (error , results) => {
//                 if (!results) {
//                   db.query('INSERT INTO likes SET ?', {user_id: user_id, post_id: post_id},(error,results) => {
//                       if (error) {
//                           console.log(error);
//
//                 }
