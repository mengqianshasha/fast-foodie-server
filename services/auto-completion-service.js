const {getYelpAutoCompletion} = require("../data/api/auto-completion-api");


module.exports = (app) => {
    const getAutoCompletionList = (req, res) => {
        console.log("here!");
        getYelpAutoCompletion(req.params.term)
            .then(response=>{
                res.json(response);
            })
            .catch(()=>{
                res.sendStatus(404);
            })
    }

    app.get("/api/autocomplete/restaurant/:term", getAutoCompletionList);

}

