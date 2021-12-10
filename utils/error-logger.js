const {json} = require("express");
const {toJSON} = require("express-session/session/cookie");
const log_axios_error = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(`error response body: ${JSON.stringify(error.response.data, null, 2)}`);
        console.log(`error response status: ${JSON.stringify(error.response.status, null, 2)}`);
        console.log(`error response header: ${JSON.stringify(error.response.headers, null, 2)}`);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
    }

    console.log(`request url: ${error.config.url}`);
    console.log(`request method: ${error.config.method}`);
    console.log(`request params: ${JSON.stringify(error.config.params, null, 2)}`);
    console.log(`request header: ${JSON.stringify(error.config.headers, null , 2)}`);
    console.log(`request body: ${JSON.stringify(error.config.data, null, 2)}`);
}

module.exports = {
    log_axios_error
}