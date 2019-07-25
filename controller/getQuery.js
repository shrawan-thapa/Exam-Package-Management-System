const express = require("express");
const { pool } = require("../database");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");

  router.get("/getPendingPackages", (req, res) => {
    const pendingPackagequery = `SELECT packageCode, dateofAssignment as assignedDate, name as assignedTo, contact, dateofSubmission as tobeSubmitted
          FROM person JOIN 
          (
              SELECT dateofAssignment, dateofSubmission, packageCode, personID FROM
              assignment JOIN package
              ON packageID = package.id
              WHERE status="Pending"
          ) AS assn
          ON person.id = assn.personID`;

    connection.query(pendingPackagequery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Pending Packages returned");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getAssignments", (req, res) => {
    const assignedQuery = `SELECT person.id, name, contact, address, packageCode, noOfPackets, dateOfAssignment, status
          FROM person JOIN
          (
              SELECT a.id, dateOfAssignment, dateOfSubmission, noOfPackets, personID, packageCode, status
              FROM assignment as a JOIN package as p 
              ON a.packageID=p.id
          ) AS asgn
          ON person.id = asgn.personID`;
    connection.query(assignedQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Assignments returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getExams", (req, res) => {
    const examGetterQuery = `SELECT exam.id, exam.date, exam.examType, subjectCode, year, part, programName 
          FROM exam JOIN (syllabus JOIN program ON programID=program.id) ON syllabusID = syllabus.id`;

    connection.query(examGetterQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Exams returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getPerson", (req, res) => {
    const getAllPerson = `SELECT * FROM person`;
    connection.query(getAllPerson, (err, result) => {
      if (err) throw err;
      else {
        console.log("All Person returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getOnePerson/:id", (req, res) => {
    const getOnePerson = `SELECT * FROM person WHERE id = ${req.params.id}`;
    connection.query(getOnePerson, (err, result) => {
      if (err) throw err;
      else {
        console.log("One Person returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getSubjectPackage/:scode", (req, res)=>{
    const getSubjectPackage = `SELECT packageCode FROM package JOIN
    (
        SELECT exam.id FROM 
        exam JOIN syllabus
        ON syllabusID = syllabus.id
        WHERE subjectCode="${req.params.scode}"
    ) as t 
    ON examID=t.id`

    connection.query(getSubjectPackage, (err, result)=>{
      if(err) throw err;
      else{
        console.log("Succeded")
        res.status(200).send(JSON.parse(JSON.stringify(result)))
      }
    });
  
  });

  connection.release();
});
module.exports = router;
