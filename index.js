import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import AuthRoutes from "./routes/AuthRoutes.js";
import GoodRoutes from "./routes/GoodRoutes.js";
import OrganizationRoutes from "./routes/OrganizationRoutes.js";
import DebugRoutes from "./routes/DebugRoutes.js";
import OrderRoutes from "./routes/OrderRoutes.js";
import ClientRoutes from "./routes/ClientRoutes.js";
import PublicRoutes from "./routes/PublicRoutes.js";
import firebaseAdmin from "firebase-admin";
import credentials from "./firebase.json" assert { type: "json" };

dotenv.config();

export const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(credentials),
});
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/api/auth/", AuthRoutes);
app.use("/api/goods/", GoodRoutes);
app.use("/api/organization/", OrganizationRoutes);
app.use("/api/orders/", OrderRoutes);
app.use("/api/debug/", DebugRoutes);
app.use("/api/clients/", ClientRoutes);
app.use("/api/public/", PublicRoutes);
app.use("/images", express.static("./images"));

app.listen(PORT, () => {
  console.log("Сервер запущен. Порт:", PORT);
});
