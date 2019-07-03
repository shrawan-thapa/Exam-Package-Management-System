const express = require("express");
const { pool } = require("../middlewares/database");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");

  //Create Database
  connection.query(
    "CREATE DATABASE IF NOT EXISTS exam_package_management_system",
    (err, result) => {
      if (err) throw err;
      console.log("Database Created");
    }
  );

  const queryCreateExam = `CREATE TABLE IF NOT EXISTS exam
   (examID INT AUTO_INCREMENT PRIMARY KEY,
    syllabusID INT, 
    examType VARCHAR(255), 
    date DATE)`;
  connection.query(queryCreateExam, (err, result) => {
    if (err) throw err;
    console.log("Table exam created");
  });

  const queryCreatePackage = `CREATE TABLE IF NOT EXISTS package
  (packageCode INT AUTO_INCREMENT PRIMARY KEY, 
   noOfCopies INT, 
   codeRange VARCHAR(255), 
   examID INT ,
   Foreign KEY (examID) references exam(examID) , 
   status VARCHAR(20))`;
  connection.query(queryCreatePackage, (err, result) => {
    if (err) throw err;
    console.log("Table package created");
  });

  const queryCreateAss = `CREATE TABLE IF NOT EXISTS assignment
   (assignmentID INT AUTO_INCREMENT PRIMARY KEY, 
   name VARCHAR(255), 
   contact VARCHAR(10), 
   address VARCHAR(255), 
   dateOfAssignment VARCHAR(20), 
   dateOfSubmission VARCHAR(20), 
   noOfPackets INT, 
   packageCode INT,
   Foreign KEY (packageCode) references  package(packageCode))`;
  connection.query(queryCreateAss, (err, result) => {
    if (err) throw err;
    console.log("Table assignment created");
  });



  connection.release();
});

module.exports = router;
