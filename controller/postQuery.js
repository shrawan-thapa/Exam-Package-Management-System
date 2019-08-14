const express = require("express");
const { pool } = require("../database");
const { check, validationResult } = require("express-validator");
const xlReader = require("xlsx");
const xlParser = require("../xlParser");
const http = require("http");
const fetch = require("node-fetch");
const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");

  router.post(
    "/addExam",
    [
      check("subjectID")
        .exists()
        .not()
        .isEmpty(),
      check("examType")
        .exists()
        .isIn("Regular", "Back"),
      check("date")
        .exists()
        .not()
        .isEmpty()
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const postExams = `INSERT INTO exam (id, subjectID, examType, date) VALUES (${null}, ${
        req.body.subjectID
      }, '${req.body.examType}','${req.body.date}')`;
      connection.query(postExams, (err, result) => {
        if (err) {
          console.log("Database Error");
          throw err;
        } else {
          console.log(`Inserted data in exams ${result}`);
          fetch(`http://localhost:4000/API/query/getExams/${result.insertId}`)
            .then(res => res.json())
            .then(json => {
              console.log(json);
              res.status(200).json({ exams: json });
            });
        }
      });
    }
  );

  router.post(
    "/addPackage",
    [
      check("packageCode")
        .exists()
        .not()
        .isEmpty(),
      check("noOfCopies")
        .exists()
        .isNumeric(),
      check("codeStart")
        .exists()
        .not()
        .isEmpty(),
      check("codeEnd")
        .exists()
        .not()
        .isEmpty()
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const status = "Not assigned";
      const postNewPack = `INSERT INTO package(id, packageCode, noOfCopies, codeStart, 
        codeEnd, examID, status) VALUES 
        (${null}, '${req.body.packageCode}', ${req.body.noOfCopies}, '${
        req.body.codeStart
      }', '${req.body.codeEnd}', ${req.body.examID}, 'Not Assigned')`;
      connection.query(postNewPack, (err, result) => {
        if (err) throw err;
        else {
          console.log(`Inserted data in packages ${result}`);
          console.log(result.insertId);
          res
            .status(200)
            .json(Object.assign(req.body, { id: result.insertId }));
        }
      });
    }
  );

  router.post(
    "/addPerson",
    [
      check("name")
        .exists()
        .not()
        .isEmpty()
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const newPerson = `INSERT INTO person
      (id, name, contact, courseCode,
        programme,
        year_part,
        subject,
        campus,
        teachingExperience,
        experienceinthisSubj,
        academicQualification,
        jobType,
        email) 
      VALUES 
        (${null}, 
        '${req.body.name}', 
        '${req.body.contact}', 
        '${req.body.courseCode}',
        '${req.body.programme}',
        '${req.body.year_part}',
        '${req.body.subject}',
        '${req.body.campus}',
        '${req.body.teachingExperience}',
        '${req.body.experienceinthisSubj}',
        '${req.body.academicQualification}',
        '${req.body.jobType}',
        '${req.body.email}'
        
        )`;
      connection.query(newPerson, (err, result) => {
        if (err) throw err;
        else {
          console.log(`Inserted data in person ${result}`);
          res
            .status(200)
            .json(Object.assign(req.body, { id: result.insertId }));
        }
      });
    }
  );

  router.post("/addAssignment", (req, res) => {
    const packageIDs = req.body.packages;
    insertList = packageIDs.map(element => {
      return [
        null,
        req.body.dateOfAssignment,
        req.body.dateOfDeadline,
        element,
        req.body.personID
      ];
    });
    console.log(insertList);
    
    // const assignQ = `INSERT INTO assignment(id, dateOfAssignment, dateOfSubmission, noOfPackets, packageID, personID)
    // VALUES (${null}, '${req.body.dateOfAssignment}', '${
    //   req.body.dateOfSubmission
    // }', ${req.body.noOfPackets}, ${req.body.packageID}, ${req.body.personID})`;
    const assignQ = `INSERT INTO assignment(id, dateOfAssignment, dateOfDeadline, packageID, personID) 
    VALUES ?;
    UPDATE package
    SET status = 'Pending'
    WHERE id IN (?);
    `;
    connection.query(assignQ, [insertList, packageIDs], (err, result) => {
      if (err) throw err;
      else {
        console.log(`Inserted data in assignment ${result}`);
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });
  //obj[0]["result on date"]

  router.post("/postExcel", (req, res) => {
    const xlFile = xlReader.readFile(
      process.cwd() + "/excelFile/TeacherList.xlsx"
    );
    console.log(`${process.cwd()}/excelFile/TeacherList.xlsx`);
    const JsonObj = xlParser(xlFile);
    const JsonArray = JsonObj.ALL;

    for (let i = 0; i < JsonArray.length; i++) {
      const newPerson = `INSERT INTO person(id, name, contact, courseCode,
  programme, year_part, subject, campus, teachingExperience,experienceinthisSubj, academicQualification,
  jobType, email) VALUES 
    (${null}, '${JsonArray[i]["Name of Teacher"]}', '${
        JsonArray[i]["Mobile No."]
      }', '${JsonArray[i]["Course Code"]}',
    '${JsonArray[i]["Programe"]}', '${JsonArray[i]["Year/Part"]}', '${
        JsonArray[i]["Subject"]
      }', '${JsonArray[i]["1 Campus Code"]}',
     '${JsonArray[i]["Teaching Experience"]}', '${
        JsonArray[i]["Eff. Exp. On this Subj. "]
      }','${JsonArray[i]["Academic Qualification"]}',
      '${
        JsonArray[i]["Type of service: \r\n(Permanent/Contract/Part-time)"]
      }', '${JsonArray[i]["Email"]}')`;
      connection.query(newPerson, (err, result) => {
        if (err) throw err;
        else {
          console.log(`Inserted data in person ${result}`);
          //res.status(200).send(result);
        }
      });
    }
  });

  connection.release();
});
module.exports = router;
