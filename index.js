const express = require("express");
const config = require("config");
const routes = require("./routes");
const test = require("./controller/edit");
const bodyParser = require("body-parser");
let loggers = require("./middlewares/logger");

const app = express();

//Middlewares
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();

});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use("/API", routes);

//PORT
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}`));
