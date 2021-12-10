const {getYelpDetail} = require("../data/api/yelp-api");
const {log_axios_error} = require("../utils/error-logger");

module.exports = (app) => {
    const getRestaurantById = (req, res) => {
        const id = req.params.id;
        getYelpDetail(id).then(business => {
          res.json(business.data)
        }).catch((e)=>{
            log_axios_error(e)
            res.sendStatus(404);
        })
    }

    app.get("/api/restaurants/:id", getRestaurantById)
}