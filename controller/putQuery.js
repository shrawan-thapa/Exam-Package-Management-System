const express = require("express");
const { pool } = require("../database");
const { check, validationResult } = require("express-validator");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");
  router.put("/receivePackage", (req, res) => {
    const updateSubmission = `UPDATE assignment JOIN package ON assignment.packageID=package.id
    SET assignment.dateOfSubmission="${req.body.dateOfSubmission}", 
    package.status="Submitted"
    WHERE assignment.id=${req.body.id};
    
    SELECT assignment.id,status,count(*) as count, examID 
    FROM assignment JOIN package ON packageID=package.id  
    WHERE examID = 
    (SELECT exam.id FROM 
    assignment JOIN package ON packageID = package.id
    JOIN exam ON examID = exam.id
    WHERE assignment.id = ${req.body.id})
    GROUP BY status
    `;

    connection.query(updateSubmission, [1, 2], (err, results) => {
      if (err) throw err;
      else {
        console.log("Submission Completed!!");
        console.log(results);
        console.log(results[0]);
        console.log(results[1]);
        const isCompleted = true;
        let examID;
        results[1].forEach(element => {
          examID = element.examID;
          if (
            (element.status === "Not assigned" && element.count > 0) ||
            (element.status === "Pending" && element.count > 0)
          ) {
            isCompleted = false;
          }
        });
        console.log(examID);

        if (isCompleted) {
          const updateExam = `UPDATE exam 
        SET isFinished= 1 
        WHERE exam.id=${examID};`;
          connection.query(updateExam, (err, results) => {
            if (err) throw err;
          });
        }
        res.status(200).send(results);
      }
    });
  });

  router.put("/editPerson/:id", (req, res) => {
    const editPersonQuery = `UPDATE person
    SET name="${req.body.name}",
    contact="${req.body.contact}",
    courseCode="${req.body.courseCode}",
    programme="${req.body.programme}",
    year_part="${req.body.year_part}",
    subject="${req.body.subject}",
    campus="${req.body.campus}",
    teachingExperience="${req.body.teachingExperience}",
    experienceinthisSubj="${req.body.experienceinthisSubj}",
    academicQualification="${req.body.academicQualification}",
    jobType="${req.body.jobType}",
    email="${req.body.email}"
    WHERE ID = ${req.params.id}
    
    `;
    connection.query(editPersonQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Updated person");
        res.status(200).send(req.body);
      }
    });
  });

  router.put("/editExam/:id", (req, res) => {
    const editExamQuery = `UPDATE exam
    SET subjectID ="${req.body.subjectID}",
    date ="${req.body.date}",
    examType ="${req.body.examType}"
    WHERE id="${req.params.id}"
   
    `;
    connection.query(editExamQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Updated exam");
        res.status(200).send(req.body);
      }
    });
  });

  router.put("/editPackage/:id", (req, res) => {
    const editPackageQuery = `UPDATE package
    SET packageCode ="${req.body.packageCode}",
    noOfCopies ="${req.body.noOfCopies}",
    codeStart ="${req.body.codeStart}",
    codeEnd ="${req.body.codeEnd}",
    examID ="${req.body.examID}"
    WHERE id="${req.params.id}"
   
    `;
    connection.query(editPackageQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Updated package");
        res.status(200).send(req.body);
      }
    });
  });

  connection.release();
});
module.exports = router;
