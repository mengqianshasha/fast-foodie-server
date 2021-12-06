const Documenu = require('documenu');
Documenu.configure('ae2628308898570014ab7abeb8c452f0')
const axios = require('axios');


module.exports = (app) => {


    // const createQueryString = async(params, required = false) => {
    //     let keys = Object.keys(params)
    //     if (keys.length == 0) return '';
    //     if (required) {
    //         for (r of required) {
    //             if (keys.indexOf(r) == -1) {
    //                 return false
    //             }
    //         }
    //     }
    
    //     let qstring = '?'
    //     for (k of keys) {
    //         qstring += (keys.indexOf(k) < keys.length - 1) ? `${k}=${params[k]}&` : `${k}=${params[k]}`;
    //     }
    //     return qstring
    
    // }

    // const params = {
    //     "lat": "40.68919",
    //     "distance": "1",
    //     "lon": "-73.992378",
    //     // "page": "1"
    // }
    
    const getMenuItems = (req, res) => {
        const coordinates = req.body;
        const geoInfo = { 
            "lat": `${coordinates.latitude}`,
            "lon": `${coordinates.longitude}`,
            "distance": "1",
            "page": "1"
        }
        Documenu.MenuItems.searchGeo(geoInfo)
            .then(result=> {
                res.send(result.data)
        });
    }

    


    app.post('/api/menuitems', getMenuItems)
    // const getAllRestaurants = (req, res) => {
    //     axios.get("http://api.yelp.com/v3/businesses/search", {
    //       headers: {
    //         "Authorization": `Bearer ${process.env.YELP_API_KEY}`
    //       },
    //       params : {
    //         "location": "seattle, WA"
    //       }
    //     }).then(result => {
    //       // console.log(result.data.businesses);
    //       res.json(result.data.businesses)
    //     })
    //   }
    
    // const getRestaurantById = (req, res) => {
    //     const id = req.params.id;
    //     axios.get(`http://api.yelp.com/v3/businesses/${id}`, {
    //       headers: {
    //         "Authorization": `Bearer ${process.env.YELP_API_KEY}`
    //       }
    //     }).then(business => {
    //       res.json(business.data)
    //     })
    // }

    // app.get("/api/restaurants", getAllRestaurants);
    // app.get("/api/restaurants/:id", getRestaurantById)
}