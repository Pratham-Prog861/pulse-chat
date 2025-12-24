import { Router } from "express";
import {
  createRoom,
  getNearbyRooms,
  joinRoom,
  getRoomDetails,
} from "../controllers/roomController.js";

const router = Router();

router.post("/", createRoom);
router.get("/nearby", getNearbyRooms);
router.post("/join", joinRoom);
router.get("/:roomId", getRoomDetails);

export default router;
