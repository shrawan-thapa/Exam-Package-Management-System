const express = require('express');
const postQuery = require('../controller/postQuery');
const getQuery = require('../controller/getQuery');
const putQuery = require('../controller/putQuery');
const deleteQuery = require('../controller/deleteQuery');
const createDB = require('../middlewares/databaseCreation');

const router = express.Router();


router.use(createDB);
router.use('/query', postQuery);
router.use('/query', getQuery);
router.use('/query', putQuery);
router.use('/query', deleteQuery);


module.exports = router;