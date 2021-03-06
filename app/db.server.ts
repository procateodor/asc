import sha256 from "crypto-js/sha256";

require("dotenv").config();

import { connection, client } from "~/libs/connection";

export const getVulnerabilities = () =>
  new Promise(async (resolve, reject) => {
    try {
      if (process.env.ENV !== "prod") {
        const value = await client.get("vulnerabilities");

        if (value) {
          resolve(JSON.parse(value)),
            {
              EX: 10,
            };
        }
      }

      connection.query(
        "select * from vulnerabilities order by id desc;",
        async (err, data) => {
          if (err) {
            reject(err);
          }

          if (process.env.ENV !== "prod") {
            await client.set("vulnerabilities", JSON.stringify(data));
          }
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

      connection.query(
        `select * from users where email = "${user.email}"`,
        function (_, model) {
          if (model?.length) {
            resolve(
              JSON.stringify({
                email: "An user with this email already exists.",
              })
            );
          }

          connection.query(
            `insert into users (name, email, password) values ('${user.name}', '${user.email}', '${user.password}')`,
            () => {
              resolve(null);
            }
          );
        }
      );
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

      connection.query(
        `select * from users where email = "${user.email}"`,
        function (_, model) {
          if (!model?.length) {
            resolve([
              { email: "An user with this email doens't exists." },
              null,
            ]);
          }

          if (model[0]?.password !== user.password) {
            resolve([{ password: "The password is wrong." }, null]);
          }

          resolve([
            null,
            {
              email: model[0]?.email,
              name: model[0]?.name,
            },
          ]);
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

export const loginGoogle = (user) =>
  new Promise((resolve) => {
    try {
      connection.query(
        `select * from users where email = "${user.email}"`,
        function (_, model) {
          if (!model?.length) {
            connection.query(
              `insert into users (name, email, password) values ('${user.name}', '${user.email}', '')`,
              () => {
                resolve(user);
              }
            );
          }

          resolve(user);
        }
      );
    } catch (error) {
      console.log(error);
    }
  });
