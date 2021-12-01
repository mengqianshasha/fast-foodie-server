const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');


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


app.get("/hello", (req, res) => {
    res.send("Hello World!");
})

app.get("/api/restaurants", (req, res) => {
  axios.get("http://api.yelp.com/v3/businesses/search", {
    headers: {
      "Authorization": `Bearer ${process.env.YELP_API_KEY}`
    },
    params : {
      "location": "seattle, WA"
    }
  }).then(businesses => {
    res.json(businesses.data.businesses[0])
  })
})

app.get("/api/restaurants/:id", (req, res) => {
  const id = req.params.id;
  console.log(id)

  axios.get(`http://api.yelp.com/v3/businesses/${id}`, {
    headers: {
      "Authorization": `Bearer ${process.env.YELP_API_KEY}`
    }
    
  }).then(businesses => {
    res.json(businesses.data)
  })
})


// const yelp = require('yelp-fusion');
// const apiKey = process.env.YELP_API_KEY;

// const searchRequest = {
//   // term:'Four Barrel Coffee',
//   location: 'seattle, wa'
// };

// const client = yelp.client(apiKey);
// client.search(searchRequest).then(response => 
//   { businesses = response.jsonBody.businesses;
//     console.log(businesses);
//     const getRestaurants = (req, res) => res.json(businesses);
    
//     const getRestaurntById = (req, res) => { 
//       const id = req.params.id;
//       const restaurant = businesses.filter(business => business.id === id);
//       res.json(restaurant);
//     }

//     app.get("/api/restaurants", getRestaurants);
//     app.get("/api/restaurants/:id", getRestaurntById);
//   // const prettyJson = JSON.stringify(firstResult, null, 4);
// }).catch(e => {
//   console.log(e);
// });




app.listen(process.env.PORT || 8000);