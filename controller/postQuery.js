const express = require("express");
const { pool } = require("../database");
const { check, validationResult } = require("express-validator");

const router = express.Router();

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");

  router.post(
    "/addExam",
    [
      check("syllabusID")
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

      const postExams = `INSERT INTO exam (id, syllabusID, examType, date) VALUES (${null}, ${
        req.body.syllabusID
      }, '${req.body.examType}','${req.body.date}')`;
      connection.query(postExams, (err, result) => {
        if (err) {
          console.log("Database Error");
          throw err;
        } else {
          console.log(`Inserted data in exams ${result}`);
          res.status(200).send(result);
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
        .not()
        .isEmpty()
        .isNumeric(),
      check("codeStart")
        .exists()
        .not()
        .isEmpty(),
      check("codeEnd")
        .exists()
        .not()
        .isEmpty(),
      // check('examID').exists(),
      //check("status")
        //.exists()
        //.isIn(["Not assigned", "Pending", "Submitted"])
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const postNewPack = `INSERT INTO package(id, packageCode, noOfCopies, codeStart, 
        codeEnd, examID, status) VALUES 
        (${null}, '${req.body.packageCode}', ${req.body.noOfCopies}, '${
        req.body.codeStart
      }', '${req.body.codeEnd}', ${req.body.examID}, 'Not Assigned')`;
      connection.query(postNewPack, (err, result) => {
        if (err) throw err;
        else {
          console.log(`Inserted data in packages ${result}`);
          res.status(200).json(req.body);
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
        .isEmpty(),
      check("contact")
        .exists()
        .isLength({ min: 10, max: 10 }),
      check("address")
        .exists()
        .not()
        .isEmpty()
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const newPerson = `INSERT INTO person(id, name, contact, address) VALUES 
    (${null}, '${req.body.name}', ${req.body.contact}, '${req.body.address}')`;
      connection.query(newPerson, (err, result) => {
        if (err) throw err;
        else {
          console.log(`Inserted data in person ${result}`);
          res.status(200).send(result);
        }
      });
    }
  );

  router.post("/addAssignment", (req, res) => {
    const packageIDs = req.body.packages;
    insertList = packageIDs.map(element => {
        return [null, req.body.dateOfAssignment, req.body.dateOfSubmission, req.body.noOfPackets,
            element, req.body.personID
        ]
    });
    console.log(insertList);
    // const assignQ = `INSERT INTO assignment(id, dateOfAssignment, dateOfSubmission, noOfPackets, packageID, personID) 
    // VALUES (${null}, '${req.body.dateOfAssignment}', '${
    //   req.body.dateOfSubmission
    // }', ${req.body.noOfPackets}, ${req.body.packageID}, ${req.body.personID})`;
    const assignQ = `INSERT INTO assignment(id, dateOfAssignment, dateOfSubmission, noOfPackets, packageID, personID) 
    VALUES ?`;
    connection.query(assignQ, [insertList], (err, result) => {
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
