const express = require("express");
const { pool } = require("../database");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");

  router.get("/getPendingPackages", (req, res) => {
    const pendingPackagequery = `SELECT assignmentID as id, packageCode, dateofAssignment as assignedDate, name as assignedTo, contact, dateofDeadline as tobeSubmitted
          FROM person JOIN 
          (
              SELECT assignment.id as assignmentID,dateofAssignment, dateofDeadline, packageCode, personID,packageID FROM
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
    const examGetterQuery = `SELECT exam.id, exam.date, exam.examType, courseCode, year, part, programName, subjectID 
          FROM exam JOIN (subject JOIN program ON programID=program.id) ON subjectID = subject.id`;

    connection.query(examGetterQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Exams returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getExams/:id", (req, res) => {
    const examGetterQuery = `SELECT exam.id, exam.date, exam.examType, courseCode, academicDegree,year, part, programName, program.id as programID, subject.id as subjectID
          FROM exam JOIN (subject JOIN program ON programID=program.id) ON subjectID = subject.id WHERE exam.id = '${
            req.params.id
          }'`;

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

  router.get("/getNotAssignedPackages", (req, res) => {
    const getPack = `SELECT p.id,packageCode, noOfCopies,codeStart,codeEnd,CONCAT(programName,'(',year,'/',part,')','-',courseCode,' ',date) as examName,status FROM package as p JOIN exam as
     e on p.examID = e.id JOIN subject as s ON
     e.subjectID = s.id JOIN program as pr on pr.id = s.programID
     WHERE status="Not Assigned"`;

    connection.query(getPack, (err, result) => {
      if (err) throw err;
      else {
        console.log("All Pack returned!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getAllPackages", (req, res) => {
    const getPack = `SELECT p.id,packageCode, noOfCopies,codeStart,codeEnd,CONCAT(programName,'(',year,'/',part,')','-',courseCode,' ',date) as examName,status FROM package as p JOIN exam as
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

  router.get("/getOneAssignment/:id", (req, res) => {
    const getOnePerson = `SELECT packageCode, campus, contact,dateOfSubmission, dateOfAssignment,name,dateofDeadline as dateOfDeadline from assignment JOIN person JOIN package where personID = person.id and packageID = package.id and assignment.id =${
      req.params.id
    }; `;
    connection.query(getOnePerson, (err, result) => {
      if (err) throw err;
      else {
        console.log("One Assignment returned!!");
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

  router.get("/getPendingExamPackages/:year/:part", (req, res) => {
    const getSubjectPackage = `SELECT id, packageCode, dateofAssignment as assignedDate, name as assignedTo, contact, dateofDeadline as tobeSubmitted,year
    FROM person JOIN 
    (
        SELECT packageCode, dateOfAssignment, dateOfDeadline, personID,subject.year, subject.part FROM
        assignment JOIN package
        ON packageID = package.id
        JOIN exam
        ON examID = exam.id
        JOIN subject
        ON subjectID = subject.id
        WHERE status="Pending" AND part="${req.params.part}" AND date LIKE "${
      req.params.year
    }%"
    ) AS assn
    ON person.id = assn.personID`;

    connection.query(getSubjectPackage, (err, result) => {
      if (err) throw err;
      else {
        console.log("Succeded");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    });
  });

  router.get("/getNotAssignedExamPackages/:year/:part", (req, res) => {
    const getSubjectPackage = `SELECT package.id,packageCode, noOfCopies,codeStart,codeEnd,CONCAT(programName,'(',year,'/',part,')','-',courseCode,' ',date) as examName FROM package
    JOIN exam ON examID = exam.id
    JOIN subject ON subjectID = subject.id
    JOIN program as pr on pr.id = subject.programID
    WHERE status="Not Assigned" and part="${req.params.part}" AND date LIKE "${
      req.params.year
    }%"`;

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
  router.get("/getOnepackage/:packageCode", (req,res)=>{
    console.log(req.params.packageCode)
    const getOnePackage= `SELECT packageCode, year, part, examID,subjectName,date as examDate,person.name as assignedTo, 
    dateOfAssignment, dateOfSubmission FROM package JOIN exam JOIN subject JOIN assignment JOIN person WHERE person.id = assignment.personID 
    AND package.id = assignment.packageID AND examID = exam.id AND exam.subjectID =subject.id AND packageCode="${req.params.packageCode}"`;
    connection.query(getOnePackage, (err,result)=>{
      if(err) throw err;
      else{
        console.log("Package Retured");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    })
  });

  router.get("/getDepartmentWiseGraph", (req,res)=>{
    const getGraph = `SELECT departmentName, year, COUNT(status) as noOfPendingPackages 
    FROM department_packages GROUP by departmentName,year`;

    connection.query(getGraph, (err, result)=>{
      if(err) throw err;
      else{
        console.log("Okay now draw the graph!!");
        res.status(200).send(JSON.parse(JSON.stringify(result)));
      }
    }
    )
  })

  connection.release();
});
module.exports = router;
