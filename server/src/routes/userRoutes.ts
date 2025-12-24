import { Router } from "express";
import {
  createAnonymousUser,
  updateUsername,
} from "../controllers/userController.js";

const router = Router();

router.post("/anonymous", createAnonymousUser);
router.put("/username", updateUsername);

export default router;
