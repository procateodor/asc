const mysql = require("mysql");
const lightOrm = require("light-orm");

require("dotenv").config();

const data = require("./data.json");

const RISKS = {
  sql: 2,
  remote: 2,
  password: 4,
  "cross-site": 3,
  file: 2,
  user: 2,
  server: 3,
  bypass: 4,
  log4j: 5,
  privilege: 5,
  "directory traversal": 4,
  plugin: 1,
  credentials: 5,
  ssh: 5,
  backdoor: 3,
  disclosure: 2,
  overflow: 1,
  buffer: 1,
  metasploit: 3
};

const TOTAL_RISKS_SCORE = Object.values(RISKS).reduce((sum, value) => sum + value, 0);

const getScaledValue = (value, sourceRangeMin, sourceRangeMax, targetRangeMin, targetRangeMax) => {
  const targetRange = targetRangeMax - targetRangeMin;
  const sourceRange = sourceRangeMax - sourceRangeMin;
  return (value - sourceRangeMin) * targetRange / sourceRange + targetRangeMin;
};

const getRiskLevel = (vulnerability) => {
  let risk = Object.keys(RISKS).reduce((score, key) => vulnerability.description[1].toLowerCase().includes(key) ? score + RISKS[key] : score, 0);
  const value = Math.ceil(getScaledValue(risk, 0, TOTAL_RISKS_SCORE / 5, 1, 5));
  return value > 5 ? 5 : value;
};

// lightOrm.driver = mysql.createConnection(`mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`);
// lightOrm.driver.connect();
//
// lightOrm.driver.query("delete from vulnerabilities where 1;", () => {
//   for (const vul of data) {
//     lightOrm.driver.query(`insert into vulnerabilities (id, description, type, platform, date_published, verified, port, author, risk) values ('${vul.id}', '${vul.description[1]}', '${vul.type_id}', '${vul.platform_id}', '${vul.date_published}', '${vul.verified}', '${vul.port}', '${vul.author_id[1]}', '${Math.ceil(getRiskLevel(vul))}')`);
//   }
// });

module.exports = {
  getRiskLevel
}
