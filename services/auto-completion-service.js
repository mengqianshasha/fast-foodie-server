const {getYelpAutoCompletion} = require("../data/api/yelp-api");


module.exports = (app) => {
    const getAutoCompletionList = (req, res) => {
            getYelpAutoCompletion(req.params.term)
                .then(response=>{
                    res.json(response.data.terms);
                })
                .catch((e)=>{
                    res.sendStatus(404);
                })

    }

    app.get("/api/autocomplete/restaurant/:term", getAutoCompletionList);

}

