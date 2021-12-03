const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const CONSTANTS = require('./CONSTS');
const sesssion = require('express-session');

// Body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Configure CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(session({
    secret: 'keyboard cat',
    cookie: {}
  }));

const mongoose = require('mongoose');
mongoose.connect(CONSTANTS.MONGODB_URL);

require('./users/user-controller')(app);


app.get("/hello", (req, res) => {
    res.send("Hello World!");
})

require('./services/restaurant-service')(app);

require('./services/auto-completion-service')(app);

app.listen(process.env.PORT || 8000);