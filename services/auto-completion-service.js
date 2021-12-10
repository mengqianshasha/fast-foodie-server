const {getYelpAutoCompletion} = require("../data/api/yelp-api");
const {log_axios_error} = require("../utils/error-logger");


module.exports = (app) => {
    const getAutoCompletionList = (req, res) => {
            getYelpAutoCompletion(req.params.term)
                .then(response=>{
                    res.json(response.data.terms);
                })
                .catch((e)=>{
                    log_axios_error(e)
                    res.sendStatus(404);
                })
    }

    app.get("/api/autocomplete/restaurant/:term", getAutoCompletionList);

}

