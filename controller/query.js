const express = require('express');
const {pool} = require('../middlewares/database');


const router = express.Router();

pool.getConnection((err, connection) => {
    if(err) throw err;
    console.log('Database Connected');

    const queryString = "CREATE TABLE assignment (assignmentID INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), contact VARCHAR(10), address VARCHAR(255), dateOfAssignment VARCHAR(20), dateOfSubmission VARCHAR(20), noOfPackets INT, packageCode VARCHAR(5))";
    connection.query(queryString, (err, result)=>{
        if(err) throw err;
        console.log("Table created");
    })
    connection.release();
});

module.exports = router;