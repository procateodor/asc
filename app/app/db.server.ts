const mysql = require("mysql");
const lightOrm = require("light-orm");

require("dotenv").config();

lightOrm.driver = mysql.createConnection(
  `mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`
);
lightOrm.driver.connect();

const getVulnerabilities = () =>
  new Promise((resolve, reject) => {
    lightOrm.driver.query("select * from vulnerabilities;", (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  });

export { getVulnerabilities };
