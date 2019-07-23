const express = require('express');
const config = require('config');
const routes = require('./routes');
const test = require('./controller/edit');
const createDB = require('./middlewares/databaseCreation');
let loggers = require('./middlewares/logger');

const app = express();

//Middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));
app.use(createDB);
app.use('/API', routes);


//PORT
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}`));