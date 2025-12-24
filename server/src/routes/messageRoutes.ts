import { Router } from "express";
import { getRoomMessages } from "../controllers/messageController.js";

const router = Router();

router.get("/:roomId", getRoomMessages);

export default router;
