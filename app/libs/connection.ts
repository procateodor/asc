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

export const client = createClient({
  url: process.env.REDIS_PROD,
});
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

export const UsersCollection = new lightOrm.Collection("users");
export const connection = lightOrm.driver;
