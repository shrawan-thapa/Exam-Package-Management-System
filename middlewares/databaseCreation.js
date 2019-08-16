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
     academicDegree ENUM('Bachelors', 'Masters'),
     departmentID INT,
     Foreign KEY (departmentID) references department(id)
     )`;
    connection.query(queryCreateProgram, (err, result) => {
      if (err) throw err;
      console.log("Table program created");
    });
  
    const queryCreateSubject = `CREATE TABLE IF NOT EXISTS subject
    (id INT AUTO_INCREMENT PRIMARY KEY,
      courseCode VARCHAR(255),
      year ENUM('I', 'II','III','IV'),
      subjectName VARCHAR(255),
      part ENUM('I', 'II'),
      programID INT,
      Foreign KEY (programID) references program(id)
     )`;
    connection.query(queryCreateSubject, (err, result) => {
      if (err) throw err;
      console.log("Table syllabus created");
    });
  
    const queryCreateExam = `CREATE TABLE IF NOT EXISTS exam
     (id INT AUTO_INCREMENT PRIMARY KEY,
      subjectID INT, 
      examType ENUM('Regular', 'Back'), 
      date VARCHAR(12),
      Foreign KEY (subjectID) references subject(id))`;
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
     status ENUM('Not Assigned','Pending', 'Submitted'))`;
    connection.query(queryCreatePackage, (err, result) => {
      if (err) throw err;
      console.log("Table package created");
    });
  
    const queryCreatePerson = `CREATE TABLE IF NOT EXISTS person
    (id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255), 
      contact VARCHAR(10), 
      courseCode VARCHAR(255),
      programme VARCHAR(255),
      year_part VARCHAR(255),
      subject VARCHAR(255),
      campus VARCHAR(255),
      teachingExperience VARCHAR(255),
      experienceinthisSubj VARCHAR(255),
      academicQualification VARCHAR(255),
      jobType VARCHAR(255),
      email VARCHAR(255))`;
    connection.query(queryCreatePerson, (err, result) => {
      if (err) throw err;
      console.log("Table person created");
    });
  
    const queryCreateAss = `CREATE TABLE IF NOT EXISTS assignment
     (id INT AUTO_INCREMENT PRIMARY KEY, 
     dateOfAssignment VARCHAR(12), 
     dateOfSubmission VARCHAR(12),
     dateOfDeadline VARCHAR(12), 
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
//   next();
}

module.exports = createDB;



