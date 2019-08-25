const express = require("express");
const { pool } = require("../database");
const { check, validationResult } = require("express-validator");
const xlReader = require("xlsx");
const xlParser = require("../xlParser");
const fetch = require("node-fetch");
const router = express.Router();
const axios = require("axios");
const qs = require("qs");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, 'excelFile')
},
filename: function (req, file, cb) {
  cb(null, Date.now() + '-' +file.originalname )
}
})
var upload = multer({ storage: storage }).single('file')


pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");
  router.post('/upload',function(req, res) {
     
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
      return res.status(200).send(req.file)

    })

});
  router.post(
    "/addExam",
    [
      check("subjectID")
        .exists()
        .not()
        .isEmpty(),
      check("examType").exists(),
      check("date")
        .exists()
        .not()
        .isEmpty()
    ], 
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({ errors: errors.array() });
      }

      const postExams = `INSERT INTO exam (id, subjectID, examType, date) VALUES (${null}, ${
        req.body.subjectID
      }, '${req.body.examType}','${req.body.date}')`;
      connection.query(postExams,  (err, result) => {
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
        if (err){
          console.log(err);
          res.status(400).send(err); 
         }
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
        if (err){
          console.log(err);
          res.status(400).send(err); 
         }
        else {
          console.log(`Inserted data in person ${result}`);
          res
            .status(200)
            .json(Object.assign(req.body, { id: result.insertId }));
        }
      });
    }
  );


  router.post("/getSemSubject", (req, res)=>{
      data = {
        'prog':req.body.prog,
        'year':req.body.year,
        'part':req.body.part
    }
    console.log(data);
    
   axios({
      method: 'post',
      url: 'http://pcampus.edu.np/api/subjects/',
      data:qs.stringify(data),
      config: { headers: {'Content-Type': 'application/x-www-form-urlencoded' }}
      })
.then((resp) => {
  console.log(`statusCode: ${resp.statusCode}`)
  console.log(resp.data)
  res.status(200).send(resp.data);
})
.catch((error) => {
  console.error(error)
  res.send(error)
});
    

  });

  router.post("/addAssignment",  (req, res) => {
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
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log(`Inserted data in assignment ${result}`);
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });

  router.post("/addDepartment", (req, res) => {
    const depQuery = `INSERT INTO department (id, departmentName) VALUES (null, '${req.body.departmentName}')`;
    connection.query(depQuery, (err, result) => {
      if (err){
        console.log(err);
        res.status(400).send(err); 
       }
      else {
        console.log(`Inserted data in department ${result}`);
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });

  router.post("/addProgram", (req, res) => {
    const progQuery = `INSERT INTO program (id, programName, academicDegree, departmentID) VALUES (null, '${req.body.programName}', '${req.body.academicDegree}',${req.body.departmentID})`;
    connection.query(progQuery, (err, result) => {
      if (err) {
        console.log(err);
        re.status(400).send(err);
      }
      else {
        console.log(`Inserted data in program ${result}`);
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });
  //obj[0]["result on date"]

  router.post("/addDepartment", (req, res) => {
    const postDepartment = `
    INSERT INTO department 
    (departmentName) 
    VALUES ('${req.body.departmentName}')`;
    connection.query(postDepartment, (err, result) => {
      if (err) {
        console.log("Database Error");
        throw err;
      } else {
        console.log(`Inserted data in department ${result}`);
        res.status(200).send();
      }
    });
  });

  router.post("/addProgram", (req, res) => {
    const postDepartment = `
    INSERT INTO program 
    (programName, academicDegree, departmentID) 
    VALUES ('${req.body.programName}', '${req.body.level}', ${req.body.departmentID})`;
    connection.query(postDepartment, (err, result) => {
      if (err) {
        console.log("Database Error");
        throw err;
      } else {
        console.log(`Inserted data in program ${result}`);
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));;      
      }
    });
  });

  router.post("/addSubject", (req, res) => {
    const postDepartment = `
    INSERT INTO subject 
    (courseCode, year, subjectName, part, programID) 
    VALUES ('${req.body.courseCode}', '${req.body.year}', '${req.body.subjectName}',
    '${req.body.part}', ${req.body.programID})`;
    connection.query(postDepartment, (err, result) => {
      if (err) {
        console.log("Database Error");
        throw err;
      } else {
        console.log(`Inserted data in subject ${result}`);
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));;
      }
    });
  });

  router.post("/postExcel", (req, res) => {
    const xlFile = xlReader.readFile(
      process.cwd() + "/excelFile/TeacherList.xlsx"
    );
    console.log(`${process.cwd()}/excelFile/TeacherList.xlsx`);
    const JsonObj = xlParser(xlFile);
    const JsonArray = JsonObj.ALL;

    for (let i = 0; i < JsonArray.length; i++) {
      
      const getPerson = `SELECT * FROM person WHERE person.name = '${JsonArray[i]["Name of Teacher"]}' AND
        person.courseCode = "${JsonArray[i]["Course Code"]}" AND contact = '${JsonArray[i]["Mobile No."]}'
         AND email = '${JsonArray[i]["Email"]}'`;
       //const getOnePerson = `SELECT * FROM person WHERE id = ${req.params.id} `;
       connection.query(getPerson, (err, result) => {
        if (err){
          console.log(err);
          res.status(400).send(err); 
         }
        else {
          if(result === null){
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
        if (err){
          console.log(err);
          res.status(400).send(err); 
         }
        else {
          console.log(`Inserted data in person ${result}`);
          //res.status(200).send(result);
        }
      });
          }
        }
      });

      /*const newPerson = `INSERT INTO person(id, name, contact, courseCode,
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
      });*/
    }

    res.status(200).send("Added");
  });

  router.post("/initializeSubjects", async (req, res) => {
    const departmentList = [
      ["Department Of Civil Engineering"],
      ["Department of Mechanical Engineering"],
      ["Department of Electrical Engineering"],
      ["Department of Electronics and Computer Engineering"]
    ];
    const programList = [
      ["BCT", "Bachelors", 4],
      ["BEX", "Bachelors", 4],
      ["BCE", "Bachelors", 1],
      ["BEL", "Bachelors", 3],
      ["BME", "Bachelors", 2]
    ];
    const progs = ["BCT", "BEX", "BCE", "BEL", "BME"];
    const years = [1, 2, 3, 4];
    const parts = [1, 2];

    const intitalizeDepartments = `INSERT INTO department (departmentName) VALUES ?`;
    connection.query(intitalizeDepartments, [departmentList], (err, result) => {
      if (err) {
        console.log("Database Error");
        throw err;
      } else {
        console.log(`Inserted departments`);
      }
    });
    const initializePrograms = `INSERT INTO program (programName, academicDegree, departmentID) VALUES ?    `;
    connection.query(initializePrograms, [programList], (err, result) => {
      if (err) {
        console.log("Database Error");
        throw err;
      } else {
        console.log(`Inserted departments`);
      }
    });

    progs.forEach(async (prog, progIdx) => {
      years.forEach(async year => {
        parts.forEach(async part => {
          data = {
            prog,
            year,
            part
          };

          await axios({
            method: "post",
            url: "http://pcampus.edu.np/api/subjects/",
            data: qs.stringify(data),
            config: {
              headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
          })
            .then(resp => {
              console.log(`statusCode: ${resp.statusCode}`);
              console.log(resp.data);
              console.log(resp.data.length);
              console.log(resp.data[0]);
              const subjectList = resp.data.map((el, index) => {
                const mapping = { 1: "I", 2: "II", 3: "III", 4: "IV" };
                return el
                  .slice(0, 2)
                  .concat([mapping[year], mapping[part], progIdx + 1]);
              });
              //   res.status(200).send(resp.data);
              console.log(subjectList);

              const initializeSubjects = `INSERT INTO subject (courseCode, subjectName, year, part, programID) VALUES ?    `;
              connection.query(
                initializeSubjects,
                [subjectList],
                (err, result) => {
                  if (err) {
                    console.log("Database Error");
                    throw err;
                  } else {
                    console.log(`Inserted subjects`);
                  }
                }
              );
            })
            .catch(error => {
              console.error(error);
              //   res.send(error);
            });
        });
      });
    });
  });

  connection.release();
});
module.exports = router;
