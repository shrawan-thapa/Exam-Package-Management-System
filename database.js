const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "root",
  database: "exam_package_management",
  multipleStatements: true
});

module.exports.pool = pool;
