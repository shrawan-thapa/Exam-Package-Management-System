const express = require("express");
const { pool } = require("../database");
const { check, validationResult } = require("express-validator");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");

  router.put("/updateSubmission", (req, res)=>{
    updateSubmission=`UPDATE assignment JOIN package ON packageID=package.id
    SET dateOfSubmission="${req.body.dateOfSubmission}", status="${req.body.status}"
    WHERE status="Pending" AND packageCode="${req.body.packageCode}"`

    connection.query(updateSubmission, (err, result)=>{
      if(err) throw err;
      else{
        console.log("Submission Completed!!");
        res.status(200).send(result)
      }
    });
  });
  connection.release();

});
module.exports = router;
