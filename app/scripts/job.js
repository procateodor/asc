const mysql = require("mysql");
const lightOrm = require("light-orm");

require("dotenv").config();

const data = require("./data.json");
const { getRiskLevel } = require("./import");
const Ably = require("ably");

lightOrm.driver = mysql.createConnection(`mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`);
lightOrm.driver.connect();

const ably = new Ably.Realtime(process.env.ABLY);
const channel = ably.channels.get("all");

const addVulnerability = () => {
  const random = data[Math.floor(Math.random() * data.length)];

  lightOrm.driver.query(`select id from vulnerabilities ORDER BY id DESC LIMIT 1;`, (err, data) => {
    if (data[0]?.id) {
      const vul = { ...random, id: data[0]?.id + 1, risk: Math.ceil(getRiskLevel(random)) };
      lightOrm.driver.query(`insert into vulnerabilities (id, description, type, platform, date_published, verified, port, author, risk) values ('${vul.id}', '${vul.description[1]}', '${vul.type_id}', '${vul.platform_id}', '${vul.date_published}', '${vul.verified}', '${vul.port}', '${vul.author_id[1]}', '${vul.risk}')`, (err) => {
        if (!err) {
          channel.publish("all", JSON.stringify({
            id: vul.id,
            description: vul.description[1],
            type: vul.type_id,
            platform: vul.platform_id,
            date_published: vul.date_published,
            verified: vul.verified,
            port: vul.port,
            author: vul.author_id[1],
            risk: vul.risk
          }));
        }
      });
    }
  });
};

setInterval(() => {
  addVulnerability();
}, 2000);
