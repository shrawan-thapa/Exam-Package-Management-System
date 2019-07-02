const express = require('express');
const config = require('config');
const exams = require('./routes/exam')

const app = express();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));
app.use('/exam', exams);


//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));