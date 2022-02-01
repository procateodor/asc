import { createClient } from "redis";
const mysql = require("mysql");
const lightOrm = require("light-orm");

require("dotenv").config();

lightOrm.driver = mysql.createConnection(
  `mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?ssl=true`
);

lightOrm.driver.on("error", (error) => {
  console.log(error);
});

lightOrm.driver.connect();

let redisClient = null;

if (process.env.ENV !== "prod") {
  redisClient = createClient({
    url: process.env.REDIS_PROD,
  });
  redisClient.on("error", (err) => console.log("Redis redisClient Error", err));
  redisClient.connect();
}

export const UsersCollection = new lightOrm.Collection("users");
export const connection = lightOrm.driver;
export const client = redisClient;
