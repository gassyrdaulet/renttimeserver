import { Router } from "express";

const router = new Router();

router.post("/printdata", async (req, res) => {
  try {
    console.log(req.body);
    res.status(200).json({ message: "OK" });
  } catch (e) {
    res.status(400).json({ message: e.code });
  }
});

export default router;
