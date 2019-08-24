const express = require("express");
const { pool } = require("../database");
const { check, validationResult } = require("express-validator");
const adbs = require("ad-bs-converter");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");
  router.put("/receivePackage", (req, res) => {
    /*
    3 queries
    1. Update the package status to "submitted" and record the date
    2. Check if all packages for that exam have been returned
    3. Extend deadline of second package by 7 days
    */
    const updateSubmission = `UPDATE assignment JOIN package ON assignment.packageID=package.id
    SET assignment.dateOfSubmission="${req.body.dateOfSubmission}", 
    package.status="Submitted"
    #SET package.status = "Pending"
    WHERE assignment.id=${req.body.id};
    
    SELECT assignment.id,status,count(*) as count, examID 
    FROM assignment JOIN package ON packageID=package.id  
    WHERE examID = 
    (SELECT exam.id FROM 
    assignment JOIN package ON packageID = package.id
    JOIN exam ON examID = exam.id
    WHERE assignment.id = ${req.body.id})
    GROUP BY status;

    SELECT packageID, personID, dateOfDeadline, status
    FROM assignment JOIN package ON packageID = package.id
    WHERE personID = (SELECT personID 
        FROM assignment
        WHERE assignment.id=${req.body.id}) AND status='Pending'
    `;

    connection.query(updateSubmission, [1, 2], (err, results) => {
      if (err) throw err;
      else {
        console.log("Submission Completed!!");
        console.log(results);
        console.log(results[0]);
        console.log(results[1]);
        console.log(results[2]);

        //Finish the exam if it was the last package
        let isCompleted = true;
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

        //Extend any other package date by 7 days
        console.log(results[2].length);
        if (results[2].length > 0) {
          let dateOfDeadline = results[2][0].dateOfDeadline;
          let eng = adbs.bs2ad(dateOfDeadline);
          console.log(adbs.bs2ad("2076/5/7"));
          console.log("Initial: ", dateOfDeadline);
          //   console.log("Initial: ", eng);
          let englishDate = new Date(eng.year, eng.month - 1, eng.day);
          console.log("ENG ", englishDate);
          englishDate.setDate(englishDate.getDate() + 7);
          console.log(
            "ENG ",
            englishDate.getFullYear() +
              "/" +
              (englishDate.getMonth() + 1) +
              "/" +
              (englishDate.getDate() - 1)
          );

          //Convert back to nepali
          const nepaliDate = adbs.ad2bs(
            englishDate.getFullYear() +
              "/" +
              (englishDate.getMonth() + 1) +
              "/" +
              englishDate.getDate()
          ).en;
          console.log(nepaliDate);
          dateOfDeadline = [
            nepaliDate.year,
            nepaliDate.month,
            nepaliDate.day
          ].join("/");
          console.log("Final: ", dateOfDeadline);

          const personID = results[2][0].personID;
          console.log(personID);
          const updateDeadline = `UPDATE assignment
                  SET dateOfdeadline= '${dateOfDeadline}'
                  WHERE personID=${personID};`;
          connection.query(updateDeadline, (err, results) => {
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

  router.put("/editSubject/:id", (req, res) => {
    const editSubjectQuery = `UPDATE subject
    SET courseCode ="${req.body.courseCode}",
    year ="${req.body.year}",
    subjectName ="${req.body.subjectName}",
    part ="${req.body.part}",
    programID ="${req.body.programID}"
    WHERE id="${req.params.id}"
   
    `;
    connection.query(editSubjectQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Updated subject");
        res.status(200).send(req.body);
      }
    });
  });

  router.put("/editProgram/:id", (req, res) => {
    const editProgramQuery = `UPDATE program
    SET programName ="${req.body.programName}",
    academicDegree ="${req.body.academicDegree}",
    departmentID ="${req.body.departmentID}"
    WHERE id="${req.params.id}"
    `;
    connection.query(editProgramQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Updated program");
        res.status(200).send(req.body);
      }
    });
  });

  router.put("/editDepartment/:id", (req, res) => {
    const editDeparmentQuery = `UPDATE department
    SET departmentName ="${req.body.departmentName}"
    WHERE id="${req.params.id}"
    `;
    connection.query(editDeparmentQuery, (err, result) => {
      if (err) throw err;
      else {
        console.log("Updated department");
        res.status(200).send(req.body);
      }
    });
  });

  connection.release();
});
module.exports = router;
