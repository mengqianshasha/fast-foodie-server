const axios = require('axios');

module.exports = (app) => {
    const getAllRestaurants = (req, res) => {
        axios.get("http://api.yelp.com/v3/businesses/search", {
          headers: {
            "Authorization": `Bearer ${process.env.YELP_API_KEY}`
          },
          params : {
            "location": "seattle, WA"
          }
        }).then(result => {
          // console.log(result.data.businesses);
          res.json(result.data.businesses)
        })
      }
    
    const getRestaurantById = (req, res) => {
        const id = req.params.id;
        axios.get(`http://api.yelp.com/v3/businesses/${id}`, {
          headers: {
            "Authorization": `Bearer ${process.env.YELP_API_KEY}`
          }
        }).then(business => {
          res.json(business.data)
        })

    }

    app.get("/api/restaurants", getAllRestaurants);
    app.get("/api/restaurants/:id", getRestaurantById)

}