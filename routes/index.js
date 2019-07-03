const express = require('express');
const query = require('../controller/query');

const router = express.Router();

router.use('/query', query);

module.exports = router;