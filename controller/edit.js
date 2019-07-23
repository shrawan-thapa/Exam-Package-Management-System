const express = require("express");
const router = express.Router();
const { pool } = require("../middlewares/database");

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" }
];

//Routes
router.get("/exam", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Database Connected");

    //Create Database
    connection.query("SELECT * from exam", (err, result, fields) => {
      if (err) throw err;
      console.log(result);
      //   console.log(fields);
      res.send(JSON.parse(JSON.stringify(result)));
    });
    connection.release();
  });
});

router.get("/department", (req, res)=>{
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Database Connected");

    //Create Database
    connection.query("SELECT * from department", (err, result, fields) => {
      if (err) throw err;
      console.log(result);
      //   console.log(fields);
      res.send(JSON.parse(JSON.stringify(result)));
    });
    connection.release();
  });
});

router.get("/", (req, res) => {
  res.send("Hello World");
});

router.get("/package", (req, res) => {
  res.send(courses);
});

router.get("/package/:id", (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) res.status(404).send("Course with the given ID not found");
  res.send(course);
});

router.post("/exam/package", (req, res) => {
  
});

module.exports = router;
