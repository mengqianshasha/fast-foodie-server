const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const CONSTANTS = require('./CONSTS');
const session = require('express-session');

const axios = require('axios');

/************************************ Configure CORS************************************/
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", CONSTANTS.CLIENT_URL);
    res.header("Access-Control-Allow-Headers",
               "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods",
               "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

/************************************ Configure CORS************************************/
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/********************************Mongoose Configure************************************/
const mongoose = require('mongoose');
mongoose.connect(CONSTANTS.MONGODB_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, `Database with url ${CONSTANTS.MONGODB_URL} connection error: `));
db.once("open", function () {
    console.log(`Database with url ${CONSTANTS.MONGODB_URL} connected successfully`);
});

/********************************Session Configure*************************************/
app.use(session({
                    secret: 'keyboard cat',
                    cookie: {MaxAge: 600000000000},
                    resave: false,
                    saveUninitialized: true
                }));


/***********************************Services************************************/

require('./services/user-service')(app);
require('./services/restaurant-service')(app);
require('./services/menu-service')(app);
require('./services/search-service')(app);
require('./services/auto-completion-service')(app);
require('./services/activity-service')(app);
require('./services/review-service')(app);
require('./services/claim-service')(app);

app.listen(process.env.PORT || 8000);