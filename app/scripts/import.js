const mysql = require("mysql");
const lightOrm = require("light-orm");

require("dotenv").config();

const data = require("./data.json");

lightOrm.driver = mysql.createConnection(
  `mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`
);
lightOrm.driver.connect();

lightOrm.driver.query("delete from vulnerabilities where 1;", () => {
  for (const vul of data) {
    lightOrm.driver.query(
      `insert into vulnerabilities (id, description, type, platform, date_published, verified, port, author) values ('${vul.id}', '${vul.description[1]}', '${vul.type_id}', '${vul.platform_id}', '${vul.date_published}', '${vul.verified}', '${vul.port}', '${vul.author_id[1]}')`
    );
  }
});
