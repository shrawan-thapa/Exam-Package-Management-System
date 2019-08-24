const express = require("express");
const config = require("config");
const routes = require("./routes");
const bodyParser = require("body-parser");
const path = require('path');
const app = express();

//Middlewares
//Allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, 'build')));

// app.get('*', function(req, res) {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.use("/API", routes);

//PORT
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}`));
