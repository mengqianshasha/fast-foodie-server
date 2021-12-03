const axios = require('axios');
const YELP_AUTO_COMPLETION_API_URL = "https://api.yelp.com/v3/autocomplete";

const getYelpAutoCompletion = (term) => {
    return axios.get(YELP_AUTO_COMPLETION_API_URL,{
        headers: {
            "Authorization": `Bearer ${process.env.YELP_API_KEY}`
        },
        params : {
            "text": term
        }
    })

}

module.exports = {
    getYelpAutoCompletion
}