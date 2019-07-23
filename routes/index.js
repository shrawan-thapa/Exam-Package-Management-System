const express = require('express');
const query = require('../controller/query');
const createDB = require('../middlewares/databaseCreation');

const router = express.Router();


router.use(createDB);
router.use('/query', query);


module.exports = router;