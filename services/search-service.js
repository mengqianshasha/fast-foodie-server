const {getYelpSearch} = require("../data/api/yelp-api");

module.exports = (app) => {
    const searchRestaurants = (req, res) => {

        getYelpSearch(req.params.location, req.query)
            .then(response=>{
                res.json(response.data['businesses']);
            })
            .catch((e)=>{
                res.sendStatus(404);
            })
    }

    /**
     * @swagger
     * /api/search/{location}:
     *    get:
     *      description: This should return search result in terms of location and other optional search params
     *      parameters:
     *        - in: path
     *          name: location
     *          schema:
     *            type: string
     *          required: true
     *          description: define location of the search
     *        - in: query
     *          name: term
     *          schema:
     *            type: string
     *          required: false
     *          description: define search term
     */
    app.get("/api/search/:location?", searchRestaurants)

}