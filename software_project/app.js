const express = require('express');

const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const app = express();
const router = require('./router.js');
const auth = require('./auth.js');
const post = require('./post.js');



app.set('view engine', '.hbs');
app.set('views', './views');


const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'influencerblog'
});

db.connect((error)=>{
    if (error){
        console.log(error)
    } else {
        console.log("Connected..")
    }
});

app.use('/static',express.static('static'));
app.use('/images', express.static('images'));

//to make sure we can grab the data from any form
app.use(express.urlencoded({extended : false}));
// to make sure we read json data
app.use(express.json());
app.use(cookieParser());


app.use('/', router);
app.use('/auth', auth);
app.use('/post', post);



app.listen(3000);
