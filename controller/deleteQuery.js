const express = require("express");
const { pool } = require("../database");
const { check, validationResult } = require("express-validator");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err){
   console.log(err);
   res.status(400).send(err); 
  }
  console.log("Database Connected");

  router.delete("/deleteExam/:id", (req, res)=>{
    const deleteExamQuery = `DELETE FROM exam WHERE id = ${req.params.id}`;
    connection.query(deleteExamQuery, (err, result) => {
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log(`Deleted data in exam ${result}`);
        res
          .status(200)
          .json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });

  router.delete("/deletePackage/:id", (req, res)=>{
    const deletePackageQuery = `DELETE FROM package WHERE id = ${req.params.id}`;
    connection.query(deletePackageQuery, (err, result) => {
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log(`Deleted data in Package ${result}`);
        res
          .status(200)
          .json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });

  router.delete("/deletePerson/:id", (req, res)=>{
    const deletePersonQuery = `DELETE FROM package WHERE id = ${req.params.id}`;
    connection.query(deletePersonQuery, (err, result) => {
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log(`Deleted data in person ${result}`);
        res
          .status(200)
          .json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });


  
  router.delete("/deleteAssignment/:id", (req, res)=>{
    const deletePersonQuery = `DELETE FROM package WHERE id = ${req.params.id}`;
    connection.query(deletePersonQuery, (err, result) => {
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
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
