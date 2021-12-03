const axios = require('axios');
const YELP_API_URL = "https://api.yelp.com/v3";

const getYelpAutoCompletion = (term) => {
    return axios.get(`${YELP_API_URL}/autocomplete`,{
        headers: {
            "Authorization": `Bearer ${process.env.YELP_API_KEY}`
        },
        params : {
            "text": term
        }
    })
}

const getYelpSearch = (location, params) => {
    const config = {
        headers: {
            "Authorization": `Bearer ${process.env.YELP_API_KEY}`
        },
        params: {
            "categories": "restaurants",
            "location": location
        }
    };
    Object.keys(params).map(key => config.params[key] = params[key])
    return axios.get(`${YELP_API_URL}/businesses/search`, config)
}

module.exports = {
    getYelpAutoCompletion,
    getYelpSearch
}