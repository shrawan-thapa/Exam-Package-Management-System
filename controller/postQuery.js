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



const storage = multer.diskStorage({
  //multers disk storage settings
  destination: function(req, file, cb) {
    cb(null, process.cwd() + "/excelFile/");
  },
  filename: function(req, file, cb) {
    cb(null, "TeacherList.xlsx");
  }
});
const upload = multer({
  //multer settings
  storage: storage
}).single("file");

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database Connected");
  router.post("/upload", function(req, res) {
    upload(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json(err);
      } else if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).send(req.file);
    });
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

      const postExams = `INSERT INTO exam (id, subjectID, examType, date, isFinished) VALUES (${null}, ${
        req.body.subjectID
      }, '${req.body.examType}','${req.body.date}', 0)`;
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
        if (err) {
          console.log(err);
          res.status(400).send(err);
        } else {
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
        if (err) {
          console.log(err);
          res.status(400).send(err);
        } else {
          console.log(`Inserted data in person ${result}`);
          res
            .status(200)
            .json(Object.assign(req.body, { id: result.insertId }));
        }
      });
    }
  );

  router.post("/getSemSubject", (req, res) => {
    data = {
      prog: req.body.prog,
      year: req.body.year,
      part: req.body.part
    };
    console.log(data);

    axios({
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
        res.status(200).send(resp.data);
      })
      .catch(error => {
        console.error(error);
        res.send(error);
      });
  });

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
      if (err) {
        console.log(err);
        res.status(400).send(err);
      } else {
        console.log(`Inserted data in assignment ${result}`);
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });

  router.post("/addDepartment", (req, res) => {
    const depQuery = `INSERT INTO department (id, departmentName) VALUES (null, '${req.body.departmentName}')`;
    connection.query(depQuery, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      } else {
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
      } else {
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
        res.status(200).send(Object.assign(req.body, { id: result.insertId }));
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
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));
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
        res.status(200).json(Object.assign(req.body, { id: result.insertId }));
      }
    });
  });




  router.post("/postExcel", (req, res) => {
    const xlFile = xlReader.readFile(
      process.cwd() + "/excelFile/TeacherList.xlsx"
    );

    function get_header_row(sheet) {
      var headers = [];
      var range = xlReader.utils.decode_range(sheet['!ref']);
      var C, R = range.s.r; /* start in the first row */
      /* walk every column in the range */
      for(C = range.s.c; C <= range.e.c; ++C) {
          var cell = sheet[xlReader.utils.encode_cell({c:C, r:R})] /* find the cell in the first row */
  
          var hdr = "UNKNOWN " + C; // <-- replace with your desired default 
          if(cell && cell.t) hdr = xlReader.utils.format_cell(cell);
  
          headers.push(hdr);
      }
      return headers;
  }
    const wsname = xlFile.SheetNames[0]
    const ws = xlFile.Sheets[wsname]
    const header = get_header_row(ws)
    //console.log(header)


    //console.log(`${process.cwd()}/excelFile/TeacherList.xlsx`);
    const JsonObj = xlParser(xlFile);
    const JsonArray = JsonObj.ALL;
    var count = 0;
    let nameOfTeacher,contact,courseCode,effExperience,teachingExperience,campusCode,program,email, academicQualification,year_part,jobType,subjectName;

    //console.log(keys)
    
    
    for (let key of header)
    {
      if((key.toLowerCase().includes("name")||key.toLowerCase().includes("teacher"))&&!key.toLowerCase().includes("subject"))
      {
        nameOfTeacher = key;
      }
      else if((key.toLowerCase().includes("contact")||key.toLowerCase().includes("mobile")))
      {
        contact = key;
       
      }
      else if((key.toLowerCase().includes("course code")||key.toLowerCase().includes("subject code")))
      {
        courseCode = key;
        
      }
      else if(key.toLowerCase().includes("program"))
      {
        program = key;
        
      }
      else if(key.toLowerCase().includes("teaching"))
      {
        teachingExperience = key;
      
      }
      else if(key.toLowerCase().includes("eff"))
      {
        effExperience = key;
        
      }
      else if(key.toLowerCase().includes("academic")&&key.toLowerCase().includes("qualification"))
      {
        academicQualification = key;
       
      }
      else if(key.toLowerCase().includes("campus"))
      {
        campusCode = key;
       
      }
      else if(key.toLowerCase().includes("email"))
      {
        email=key;
        
      }
      else if(key.toLowerCase().includes("year")&&key.toLowerCase().includes("part"))
      {
        year_part = key;
        
      }
      else if((key.toLowerCase().includes("job type")||key.toLowerCase().includes("type")||key.toLowerCase().includes("type of service")))
      {
        jobType = key;
        
      }
      else if(key.toLowerCase().includes("subject"))
      {
        subjectName = key;
        
      }
      else 
      {
        console.log("Not matched with any",key)
      }

  }
  console.log(nameOfTeacher,contact,courseCode,effExperience,teachingExperience,campusCode,program,email, academicQualification,year_part,jobType,subjectName)
  console.log(JsonArray[0][nameOfTeacher]) 
  
  for (let i = 0; i < JsonArray.length; i++) {
      const getPerson = `SELECT * from person where name = "${
        JsonArray[i][`${nameOfTeacher}`]
      }" and 
        contact = "${JsonArray[i][contact]}" and courseCode = "${
        JsonArray[i][courseCode]
      }"`;
      connection.query(getPerson, (err, result) => {
        if (err) throw err;
        else {
          //console.log(i, " ", result.length);
          if (result.length == 0) {
            const newPerson = `INSERT INTO person(id, name, contact, courseCode,
                    programme, year_part, subject, campus, teachingExperience,experienceinthisSubj, academicQualification,
                    jobType, email) VALUES 
                      (${null}, "${JsonArray[i][`${nameOfTeacher}`]}", 
                      "${JsonArray[i][contact]}", "${
              JsonArray[i][courseCode]
            }",
                      "${JsonArray[i][program]}", "${
              JsonArray[i][year_part]
            }", "${JsonArray[i][subjectName]}", "${
              JsonArray[i][campusCode]
            }",
                       "${JsonArray[i][teachingExperience]}", "${
              JsonArray[i][effExperience]
            }", "${JsonArray[i][academicQualification]}",
                        "${
                          JsonArray[i][
                            jobType
                          ]
                        }", "${JsonArray[i][email]}")`;
            connection.query(newPerson, (err, result) => {
              if (err) throw err;
              else {
                console.log(`Inserted data in person ${result}`);
				count += 1;
                // res.status(200).send(result);
				if (count === JsonArray.length - 1) {
				  res.status(200).send(result);
				}
              }
            });
          } else{
			  count += 1;
			  
				if (count === JsonArray.length - 1) {
				  res.status(200).send(result);
				}
		  }
        }

      });
    }
  });
  router.get("/initializeSubjects", async (req, res) => {
    const departmentList = [
      ["Department Of Civil Engineering"],
      ["Department of Mechanical Engineering"],
      ["Department of Electrical Engineering"],
      ["Department of Electronics and Computer Engineering"],
      ["Department of Architecture"]
    ];
    const programList = [
      ["BCT", "Bachelors", 4],
      ["BEX", "Bachelors", 4],
      ["BCE", "Bachelors", 1],
      ["BEL", "Bachelors", 3],
      ["BME", "Bachelors", 2],
      ["BAE", "Bachelors", 5]
    ];
    const progs = ["BCT", "BEX", "BCE", "BEL", "BME", "BAE"];
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
                    res.status(200).send();
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