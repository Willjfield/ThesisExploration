// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
router.use(function(req,res,next){
    console.log('something is happening');
    next();
})
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});
var planets = [
        {
            name:'some name',
            size:42
        },
        {
            name:'another name',
            size:57
        }]

router.route('/kepler')
    .get(function(req,res){
            var size = req.param('size');
            for(var s in planets){
                if(planets[s].size = size){
                    res.send(planets[s])
                }
            }
            //res.send(size)
             //res.json(planet)
    })
/*
router.route('/kepler/:size')
    .get(function(req,res){
        planet.findByID(req.params.size, function(err,planet){
            res.json(planet);
        })
    })
*/

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
