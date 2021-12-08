const axios = require('axios');
const YELP_API_URL = "https://api.yelp.com/v3";

const getYelpAutoCompletion = (term) => {
    return axios.get(`${YELP_API_URL}/autocomplete`,{
        headers: {
            "Authorization": `Bearer ${process.env.YELP_API_KEY}`
        },
        params : {
            "text": term,
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
            "location": location,
            ...params
        }
    };
    return axios.get(`${YELP_API_URL}/businesses/search`, config)
}


const getYelpMatch = (params) => {
    const config = {
        headers: {
            "Authorization": `Bearer ${process.env.YELP_API_KEY}`
        },
        params: {
            country: "US",
            ...params
        }
    }
    return axios.get(`${YELP_API_URL}/businesses/matches`, config)

}

const getYelpDetail = (id) => {
    const config = {
        headers: {
            "Authorization": `Bearer ${process.env.YELP_API_KEY}`
        }
    }
    return axios.get(`${YELP_API_URL}/businesses/${id}`, config)
}
module.exports = {
    getYelpAutoCompletion,
    getYelpSearch,
    getYelpMatch,
    getYelpDetail
}