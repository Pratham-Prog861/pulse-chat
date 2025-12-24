import { Request, Response } from "express";
import { Message, Room } from "../models/index.js";

export const getRoomMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { limit = "50" } = req.query;

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    if (room.expiresAt < new Date()) {
      res.status(410).json({ error: "Room has expired" });
      return;
    }

    const messages = await Message.find({ room: roomId })
      .populate("sender", "username")
      .sort({ createdAt: 1 })
      .limit(parseInt(limit as string));

    res.json({ messages });
  } catch (error) {
    console.error("Get room messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
