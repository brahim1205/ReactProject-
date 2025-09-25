import { Router } from "express";
import { Authcontroller } from "../controllers/auth.controller";

const router = Router();
const controller = new Authcontroller();

router.post("/register", controller.register);
router.post("/login", controller.login);

export default router;
