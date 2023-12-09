import * as dotenv from "dotenv";
dotenv.config();
const isProduction = process.env?.PRODUCTION === "true";

const dbConfigProd = {
  host: "127.0.0.1",
  user: "server",
  password: "Fasicani@tion200#",
  database: "renttime",
};
const dbConfigLocal = {
  host: "138.68.68.74",
  user: "server",
  password: "Fasicani@tion200#",
  database: "renttime",
};

export default isProduction ? dbConfigProd : dbConfigLocal;
