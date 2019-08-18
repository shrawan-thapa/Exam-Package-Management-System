const express = require("express");
const { pool } = require("../database");
const { check, validationResult } = require("express-validator");
const auth = require('../middlewares/auth');

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");

  router.delete("/deleteExam/:id",auth, (req, res)=>{
    const deleteExamQuery = `DELETE FROM exam WHERE id = ${req.params.id}`;
    connection.query(deleteExamQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log(`Deleted data in exam ${result}`);
        res
          .status(200)
          .json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });

  router.delete("/deletePackage/:id",auth, (req, res)=>{
    const deletePackageQuery = `DELETE FROM package WHERE id = ${req.params.id}`;
    connection.query(deletePackageQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log(`Deleted data in Package ${result}`);
        res
          .status(200)
          .json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });

  router.delete("/deletePerson/:id",auth, (req, res)=>{
    const deletePersonQuery = `DELETE FROM package WHERE id = ${req.params.id}`;
    connection.query(deletePersonQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log(`Deleted data in person ${result}`);
        res
          .status(200)
          .json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });


  
  router.delete("/deleteAssignment/:id",auth, (req, res)=>{
    const deletePersonQuery = `DELETE FROM package WHERE id = ${req.params.id}`;
    connection.query(deletePersonQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log(`Deleted data in Assignment ${result}`);
        res
          .status(200)
          .json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });


  connection.release();
});
module.exports = router;
