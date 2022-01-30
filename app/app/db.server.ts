const mysql = require("mysql");
const lightOrm = require("light-orm");
import sha256 from "crypto-js/sha256";

require("dotenv").config();

lightOrm.driver = mysql.createConnection(
  `mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`
);
lightOrm.driver.connect();

const UsersCollection = new lightOrm.Collection("users");

export const getVulnerabilities = () =>
  new Promise((resolve, reject) => {
    lightOrm.driver.query(
      "select * from vulnerabilities order by id desc;",
      (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      }
    );
  });

export const register = (form) =>
  new Promise((resolve) => {
    if (form.get("name")?.length < 3) {
      resolve({ name: "The name must be at least 3 characters long." });
    }

    if (!form.get("email")?.length) {
      resolve({ email: "The email is required." });
    }

    if (form.get("password")?.length < 6) {
      resolve({ password: "The password must be at least 6 characters long." });
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

    UsersCollection.findOne({ email: user.email }, function (_, model) {
      if (model) {
        resolve(
          JSON.stringify({ email: "An user with this email already exists." })
        );
      }

      lightOrm.driver.query(
        `insert into users (name, email, password) values ('${user.name}', '${user.email}', '${user.password}')`,
        () => {
          resolve(null);
        }
      );
    });
  });

export const login = (form) =>
  new Promise((resolve) => {
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

    UsersCollection.findOne({ email: user.email }, function (_, model) {
      if (!model) {
        resolve([{ email: "An user with this email doens't exists." }, null]);
      }

      if (model?.get("password") !== user.password) {
        resolve([{ password: "The password is wrong." }, null]);
      }

      resolve([
        null,
        {
          email: model?.get("email"),
          name: model?.get("name"),
        },
      ]);
    });
  });
