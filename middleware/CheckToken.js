import { admin } from "../index.js";
import { User } from "../db/db.js";

export const CheckToken = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Отказано в доступе." });
    }
    const decodedValue = await admin.auth().verifyIdToken(token);
    if (decodedValue) {
      req.user = decodedValue;
      req.user.uid = 29;
      const existingUser = await User.findOne({ where: { id: req.user.uid } });
      if (existingUser) {
        if (!decodedValue.email_verified) {
          return res.status(403).json({
            message: "Unauthorized",
            email: decodedValue.email,
          });
        }
        req.user = { ...req.user, ...existingUser.get({ plain: true }) };
        return next();
      } else {
        // const newUser = await User.create({
        // });
        // req.user = { ...req.user, ...newUser.get({ plain: true }) };
        return res.status(403).json({
          message: "Unauthorized",
          data: { noSync: true, logout: true },
        });
      }
    }
    return res.status(403).json({ message: "Unauthorized" });
  } catch (e) {
    console.log(e);
    res.status(500).json("Internal Error (at CheckToken)");
  }
};
