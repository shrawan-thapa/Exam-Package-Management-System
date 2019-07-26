const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "exam_package_management_system",
  multipleStatements: true
});

module.exports.pool = pool;
