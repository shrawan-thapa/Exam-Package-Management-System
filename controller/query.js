const express = require("express");
const { pool } = require("../database");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");

  router.post("/addExam", (req, res) => {
    const postExams = `INSERT INTO exam (id, syllabusID, examType, date) VALUES (${null}, ${
      req.body.syllabusID
    }, ${req.body.examType},${req.body.date})`;
    connection.query(postExams, (err, result) => {
      if (err) {
        console.log("Database Error");
        throw err;
      } else {
        console.log(`Inserted data in exams ${result}`);
        res.status(200).send(result);
      }
    });
  });

  router.post("/addPackage", (req, res) => {
    const postNewPack = `INSERT INTO package(id, packageCode, noOfCopies, codeStart, 
        codeEnd, examId, status) VALUES 
        (${null}, '${req.body.packageCode}', ${req.body.noOfCopies}, '${
      req.body.codeStart
    }', '${req.body.codeEnd}', ${req.body.examID}, '${req.body.status}')`;
    connection.query(postNewPack, (err, result) => {
      if (err) throw err;
      else {
        console.log(`Inserted data in packages ${result}`);
        res.status(200).send(result);
      }
    });
  });

  router.post("/addPerson", (req, res) => {
    const newPerson = `INSERT INTO person(id, name, contact, address) VALUES 
    (${null}, '${req.body.name}', ${req.body.contact}, '${req.body.address}')`;
    connection.query(newPerson, (err, result) => {
      if (err) throw err;
      else {
        console.log(`Inserted data in person ${result}`);
        res.status(200).send(result);
      }
    });
  });

  router.post("/addAssignment", (req, res) => {
    const assignQ = `INSERT INTO assignment(id, dateOfAssignment, dateOfSubmission, noOfPackets, packageID, personID) 
    VALUES (${null}, ${req.body.dateOfAssignment}, ${
      req.body.dateOfSubmission
    }, ${req.body.noOfPackets}, ${req.body.packageID}, ${req.body.personID})`;
    connection.query(assignQ, (err, result) => {
      if (err) throw err;
      else {
        console.log(`Inserted data in assignment ${result}`);
        res.status(200).send(result);
      }
    });
  });

  connection.release();
});
module.exports = router;
