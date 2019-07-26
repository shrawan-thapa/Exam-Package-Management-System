const express = require("express");
const { pool } = require("../database");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");

  router.get("/getPendingPackages", (req, res) => {
    const pendingPackagequery = `SELECT id, packageCode, dateofAssignment as assignedDate, name as assignedTo, contact, dateofSubmission as tobeSubmitted
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
    const examGetterQuery = `SELECT exam.id, exam.date, exam.examType, courseCode, year, part, programName 
          FROM exam JOIN (subject JOIN program ON programID=program.id) ON syllabusID = subject.id`;

    connection.query(examGetterQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Exams returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });
  router.get("/getExams/:id", (req, res) => {
    const examGetterQuery = `SELECT exam.id, exam.date, exam.examType, courseCode, year, part, programName 
          FROM exam JOIN (subject JOIN program ON programID=program.id) ON subjectID = subject.id WHERE exam.id = '${req.params.id}'`;

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
  router.get("/getPackages", (req, res) => {
    const getAllPerson = `SELECT * FROM package`;
    connection.query(getAllPerson, (err, result) => {
      if (err) throw err;
      else {
        console.log("All Person returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get('/getPackages', (req, res) => {
    const getPack = `SELECT packageCode, noOfCopies,codeStart,codeEnd,CONCAT(programName,'(',year,'/',part,')','-',courseCode,' ',date) as examName,status FROM package as p JOIN exam as
     e on p.examID = e.id JOIN subject as s ON
     e.subjectID = s.id JOIN program as pr on pr.id = s.programID`;

     connection.query(getPack, (err, result) => {
      if (err) throw err;
      else {
        console.log("All Pack returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getOnePerson/:id", (req, res) => {
    const getOnePerson = `SELECT * FROM person WHERE id = ${req.params.id} `;
    connection.query(getOnePerson, (err, result) => {
      if (err) throw err;
      else {
        console.log("One Person returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getSubjectPackage/:scode", (req, res) => {
    const getSubjectPackage = `SELECT packageCode FROM package JOIN
    (
        SELECT exam.id FROM 
        exam JOIN subject
        ON subjectID = subject.id
        WHERE subjectCode="${req.params.scode}"
    ) as t 
    ON examID=t.id`;

    connection.query(getSubjectPackage, (err, result) => {
      if (err) throw err;
      else {
        console.log("Succeded");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getSubjectList", (req, res) => {
    const getAllPerson = `SELECT subject.id,subjectName,courseCode, year, part, programName FROM subject JOIN program
    ON programID=program.id`;
    connection.query(getAllPerson, (err, result) => {
      if (err) throw err;
      else {
        console.log("Subject List returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getDepartmentList", (req, res) => {
    const getAllPerson = `SELECT * FROM department`;
    connection.query(getAllPerson, (err, result) => {
      if (err) throw err;
      else {
        console.log("Subject List returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });
  router.get("/getProgramList", (req, res) => {
    const getAllPerson = `SELECT * FROM program`;
    connection.query(getAllPerson, (err, result) => {
      if (err) throw err;
      else {
        console.log("Subject List returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  connection.release();
});
module.exports = router;
