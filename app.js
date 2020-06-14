const express = require('express');
const bodyParser = require('body-parser');
const ziptastic = require('ziptastic');
const mongoose = require('mongoose');
const https = require("https");
require('dotenv').config();
mongoose.connect(process.env.CON, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Schema = mongoose.Schema;
var userSchema = new Schema({
  name: String,
  address1: String,
  address2: String,
  zip: Number,
  city: String,
  state: String,
  country: String
});
const User = mongoose.model('User', userSchema);
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


// get routes
app.get('/login', function(req, res) {
  res.render("login");

});

app.get('/:user', function(req, res) {
  const profileName = req.params.user;

  User.findOne({
    name: profileName
  }, function(err, result) {

    if (result) {
      const query = result.city;
      const apiKey = process.env.KEY;
      const unit = "metric";
      const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + apiKey + "&units=" + unit;

      https.get(url, function(response) {
        console.log(response.statusCode);
        response.on("data", function(data) {
          const weatherData = JSON.parse(data);
          const temp = weatherData.main.temp
          const description = weatherData.weather[0].description;
          const icon = weatherData.weather[0].icon;
          const imageUrl = "http://openweathermap.org/img/wn/" + icon + ".png";


          res.render('user', {
            name: result.name,
            address1: result.address1,
            address2: result.address2,
            zip: result.zip,
            city: result.city,
            state: result.state,
            country: result.country,
            temp: temp,
            imageUrl: imageUrl,
            desc: description,
          });
        });

      });


    } else {
      res.render("error");
    }
  });

});


// post routes
app.post('/', function(req, res) {
  const zipCode = req.body.zip;
  var query = {
    zip: zipCode,
    country: 'in'
  };
  ziptastic(query).then(function(location) {
    console.log(location);
    const cityName = location.county;
    const stateName = location.state;
    // location => {city: "New York City", state: "New York", country: "US"}
    res.send({
      city: cityName,
      state: stateName,
    });
  });

});

app.post('/login', function(req, res) {

  User.findOne({
    name: req.body.username
  }, function(err, result) {
    if (!result) {
      const newUser = new User({
        name: req.body.username
      });
      newUser.save();
    }
  });

  res.render("form", {
    name: req.body.username
  });
});


app.post('/form', function(req, res) {
  User.findOneAndUpdate({
    name: req.body.name
  }, {
    $set: {
      address1: req.body.address1,
      address2: req.body.address2,
      zip: req.body.zip,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
    }
  }, function() {
    res.redirect("/"+req.body.name);
  });
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server is up and running at port:3000");
})
