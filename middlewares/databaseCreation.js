const express = require("express");
const { pool } = require("../database");

//const router = express.Router();

createDB = function(req, res, next){
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Database Connecteds");
  
    const queryCreateDepartment = `CREATE TABLE IF NOT EXISTS department
    (id INT AUTO_INCREMENT PRIMARY KEY,
     departmentName VARCHAR(255))`;
    connection.query(queryCreateDepartment, (err, result) => {
      if (err) throw err;
      console.log("Table department created");
    });
  
    const queryCreateProgram = `CREATE TABLE IF NOT EXISTS program
    (id INT AUTO_INCREMENT PRIMARY KEY,
     programName VARCHAR(255),
     academicDegree VARCHAR(255),
     departmentID INT,
     Foreign KEY (departmentID) references department(id)
     )`;
    connection.query(queryCreateProgram, (err, result) => {
      if (err) throw err;
      console.log("Table program created");
    });
  
    const queryCreateSyllabus = `CREATE TABLE IF NOT EXISTS subject
    (id INT AUTO_INCREMENT PRIMARY KEY,
      courseCode VARCHAR(255),
      year ENUM('First', 'Second','Third','Fourth'),
      subjectName VARCHAR(255),
      part ENUM('First', 'Second'),
      programID INT,
      Foreign KEY (programID) references program(id)
     )`;
    connection.query(queryCreateSyllabus, (err, result) => {
      if (err) throw err;
      console.log("Table syllabus created");
    });
  
    const queryCreateExam = `CREATE TABLE IF NOT EXISTS exam
     (id INT AUTO_INCREMENT PRIMARY KEY,
      subjectID INT, 
      examType VARCHAR(255), 
      date VARCHAR(12),
      Foreign KEY (syllabusID) references subject(id))`;
    connection.query(queryCreateExam, (err, result) => {
      if (err) throw err;
      console.log("Table exam created");
    });
  
    const queryCreatePackage = `CREATE TABLE IF NOT EXISTS package
    (id INT AUTO_INCREMENT PRIMARY KEY, 
      packageCode VARCHAR(255),
     noOfCopies INT, 
     codeStart VARCHAR(255), 
     codeEnd VARCHAR(255),
     examID INT ,
     Foreign KEY (examID) references exam(id) , 
     status ENUM('Not assigned','Pending', 'Submitted'))`;
    connection.query(queryCreatePackage, (err, result) => {
      if (err) throw err;
      console.log("Table package created");
    });
  
    const queryCreatePerson = `CREATE TABLE IF NOT EXISTS person
    (id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255), 
      contact VARCHAR(10), 
      address VARCHAR(255)
    )`;
    connection.query(queryCreatePerson, (err, result) => {
      if (err) throw err;
      console.log("Table person created");
    });
  
    const queryCreateAss = `CREATE TABLE IF NOT EXISTS assignment
     (id INT AUTO_INCREMENT PRIMARY KEY, 
     dateOfAssignment VARCHAR(12), 
     dateOfSubmission VARCHAR(12), 
     noOfPackets INT, 
     packageID INT,
     personID INT,
     Foreign KEY (personID) references person(id),
     Foreign KEY (packageID) references package(id))`;
    connection.query(queryCreateAss, (err, result) => {
      if (err) throw err;
      console.log("Table assignment created");
    });

    const pendingView = `CREATE VIEW IF NOT EXISTS pending_packages AS 
                        SELECT package.id, status, syllabusID FROM 
                        package JOIN exam ON examID=exam.id 
                        WHERE status="Pending"`;
    
    connection.query(pendingView,(err,result)=>{
      if(err) throw err;
      else{
        console.log("Pending Packages View Created!!")
      }
    }); 

    const deptPackView = `CREATE VIEW IF NOT EXISTS department_packages AS
    SELECT departmentName, year, status FROM 
    department JOIN
    (
        SELECT year, status, departmentID  FROM
        program JOIN 
        (
            SELECT year, programID, status
            FROM syllabus JOIN pending_packages 
            ON syllabus.id=pending_packages.syllabusID
        ) AS t 
        ON program.id=t.programID
    ) as t2 ON department.id=t2.departmentID`;
    
    connection.query(deptPackView,(err,result)=>{
      if(err) throw err;
      else{
        console.log("Department Packages View Created!!")
      }
    }); 
  
    connection.release();
  });
  next();
}

module.exports = createDB;

//module.exports = router;



