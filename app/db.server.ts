const mysql = require("mysql");
const lightOrm = require("light-orm");
import { createClient } from "redis";
import sha256 from "crypto-js/sha256";

require("dotenv").config();

const client =
  process.env.ENV === "prod"
    ? createClient({
        url: process.env.REDIS_PROD,
      })
    : createClient();
client.on("error", (err) => console.log("Redis Client Error", err));

const UsersCollection = new lightOrm.Collection("users");

export const getVulnerabilities = () =>
  new Promise(async (resolve, reject) => {
    try {
      await client.connect();

      const value = await client.get("vulnerabilities");

      if (value) {
        resolve(JSON.parse(value)),
          {
            EX: 10,
          };
      }

      try {
        lightOrm.driver = mysql.createConnection(
          `mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`
        );
        lightOrm.driver.connect();
      } catch (error) {
        console.log(error);
      }

      lightOrm.driver.query(
        "select * from vulnerabilities order by id desc;",
        async (err, data) => {
          if (err) {
            lightOrm.driver.destroy();
            reject(err);
          }

          await client.set("vulnerabilities", JSON.stringify(data));
          lightOrm.driver.destroy();
          resolve(data);
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

export const register = (form) =>
  new Promise((resolve) => {
    try {
      if (form.get("name")?.length < 3) {
        resolve({ name: "The name must be at least 3 characters long." });
      }

      if (!form.get("email")?.length) {
        resolve({ email: "The email is required." });
      }

      if (form.get("password")?.length < 6) {
        resolve({
          password: "The password must be at least 6 characters long.",
        });
      }

      if (form.get("password") !== form.get("re-password")) {
        resolve({
          password: "The passwords must be the same.",
          rePassword: "The passwords must be the same.",
        });
      }

      const user = {
        name: form.get("name"),
        email: form.get("email"),
        password: sha256(form.get("password")).toString(),
      };

      try {
        lightOrm.driver = mysql.createConnection(
          `mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`
        );
        lightOrm.driver.connect();
      } catch (error) {
        console.log(error);
      }

      UsersCollection.findOne({ email: user.email }, function (_, model) {
        if (model) {
          lightOrm.driver.destroy();
          resolve(
            JSON.stringify({ email: "An user with this email already exists." })
          );
        }

        lightOrm.driver.query(
          `insert into users (name, email, password) values ('${user.name}', '${user.email}', '${user.password}')`,
          () => {
            lightOrm.driver.destroy();
            resolve(null);
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  });

export const login = (form) =>
  new Promise((resolve) => {
    try {
      if (!form.get("email")?.length) {
        resolve([{ email: "The email is required." }, null]);
      }

      if (form.get("password")?.length < 6) {
        resolve([
          {
            password: "The password must be at least 6 characters long.",
          },
          null,
        ]);
      }

      const user = {
        email: form.get("email"),
        password: sha256(form.get("password")).toString(),
      };

      try {
        lightOrm.driver = mysql.createConnection(
          `mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`
        );
        lightOrm.driver.connect();
      } catch (error) {
        console.log(error);
      }

      UsersCollection.findOne({ email: user.email }, function (_, model) {
        if (!model) {
          lightOrm.driver.destroy();
          resolve([{ email: "An user with this email doens't exists." }, null]);
        }

        if (model?.get("password") !== user.password) {
          lightOrm.driver.destroy();
          resolve([{ password: "The password is wrong." }, null]);
        }

        lightOrm.driver.destroy();
        resolve([
          null,
          {
            email: model?.get("email"),
            name: model?.get("name"),
          },
        ]);
      });
    } catch (error) {
      console.log(error);
    }
  });

export const loginGoogle = (user) =>
  new Promise((resolve) => {
    try {
      try {
        lightOrm.driver = mysql.createConnection(
          `mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`
        );
        lightOrm.driver.connect();
      } catch (error) {
        console.log(error);
      }

      UsersCollection.findOne({ email: user.email }, function (_, model) {
        if (!model) {
          lightOrm.driver.query(
            `insert into users (name, email, password) values ('${user.name}', '${user.email}', '')`,
            () => {
              lightOrm.driver.destroy();
              resolve(user);
            }
          );
        }

        lightOrm.driver.destroy();
        resolve(user);
      });
    } catch (error) {
      console.log(error);
    }
  });
