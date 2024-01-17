import { admin } from "../index.js";
import { User } from "../db/db.js";

export const login = async (req, res) => {
  try {
    console.log(req.body);
    return res.status(400).json({ message: "Ok" });
  } catch (e) {
    res.status(500).json({ message: "Unknown internal error" });
  }
};

export const registration = async (req, res) => {
  try {
    const { email, password, name, second_name, father_name, cellphone } =
      req.body;
    const newUserBody = {
      name: name.toUpperCase(),
      second_name: second_name.toUpperCase(),
      cellphone,
    };
    if (father_name) {
      newUserBody.father_name = father_name.toUpperCase();
    }
    const newUser = (await User.create(newUserBody)).get({ plain: true });
    try {
      const userResponse = await admin.auth().createUser({
        uid: newUser.id + "",
        email,
        password,
        emailVerified: false,
        disabled: false,
      });
      return res.status(201).json(userResponse);
    } catch (e) {
      await User.destroy({ where: { id: newUser.id } });
      return res.status(403).json({
        message: e?.code
          ? e.code.startsWith("auth/")
            ? e.code
            : "Unknown error"
          : "Unknown error",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(403).json({
      message: e?.code ? e.code.startsWith("auth/") && e.code : "Unknown error",
    });
  }
};

export const registrationGoogle = async (req, res) => {
  try {
    const { email } = req.body;
    const newUser = (await User.create()).get({ plain: true });
    await admin.auth().createUser({ uid: newUser.id + "", email });
    return res.status(201).json({
      message: "Google account linked successfully!",
      uid: newUser.id + "",
    });
  } catch (e) {
    console.log(e);
    return res.status(403).json({
      message: e?.code ? e.code.startsWith("auth/") && e.code : "Unknown error",
    });
  }
};

export const ping = async (req, res) => {
  try {
    const { organization, id, orgData } = req.user;
    res.status(200).json({ organizationId: organization, userId: id, orgData });
  } catch (e) {
    res.status(500).json({ message: "Ошибка сервера: " + e });
  }
};
