const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const CONSTANTS = require('./CONSTS');
const session = require('express-session');


const axios = require('axios');

// swagger

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        // Like the one described here: https://swagger.io/specification/#infoObject
        info: {
            title: 'Fast Foodie API',
            version: '1.0.0',
            description: 'Fast Foodie API with autogenerated swagger doc',
        },
    },
    // List of files to be processes. You can also set globs './routes/*.js'
    apis: ['./services/auto-completion-service.js','./services/search-service.js'],
};

const specs = swaggerJsdoc(options);
const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


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
    resave: false,
    saveUninitialized: true
  }));

const mongoose = require('mongoose');
mongoose.connect(CONSTANTS.MONGODB_URL);


require('./services/login-service')(app);



app.get("/hello", (req, res) => {
    res.send("Hello World!");
})


require('./services/restaurant-service')(app);
require('./services/search-service')(app);
require('./services/auto-completion-service')(app);
require('./services/activity-service')(app);

app.listen(process.env.PORT || 8000);