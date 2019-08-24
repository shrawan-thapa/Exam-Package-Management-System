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

  router.put("/receivePackage", (req, res) => {
    const updateSubmission = `UPDATE assignment JOIN package ON assignment.packageID=package.id
    SET assignment.dateOfSubmission="${req.body.dateOfSubmission}", 
    package.status="Submitted"
    WHERE package.id="${req.body.id}"`;

    connection.query(updateSubmission, (err, result) => {
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log("Submission Completed!!");
        console.log(result);
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));;
      }
    });
  });

  router.put("/finishExam",(req, res) =>{
    const updateExam = `UPDATE exam SET exam.examState = "Finished" where exam.id = "${req.body.id}"`;
    connection.query(updateExam, (err, result) => {
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log("Exam finished!!");
        console.log(result);
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));;
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
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log("Updated person");
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));;
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
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
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
    codeStart ="${req.body.codeStart}"
    codeEnd ="${req.body.codeEnd}"
    examID ="${req.body.examID}"
    status ="${req.body.status}"
    WHERE id="${req.params.id}"
   
    `;
    connection.query(editPackageQuery, (err, result) => {
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log("Updated package");
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));;
      }
    });
  });

  router.put("/editAssignment/:id", (req, res) =>{
    const editAssignmentCode = ` UPDATE assignment
      SET dateOfAssignment = "${req.body.dateOfAssignment}",
      dateOfSubmission = "${req.body.dateOfSubmission}",
      noOfPackets = "${req.body.noOfPackets}",
      packageID = "${req.body.packageID}",
      personID = "${req.body.personID}"
      WHERE id = "${req.params.id}"
    `;
    connection.query(editAssignmentCode, (err, result) => {
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log("Updated Assignment");
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));;
      }
    });
  });



  connection.release();
});
module.exports = router;
