import { Request, Response } from "express";
import { Room, User } from "../models/index.js";
import mongoose from "mongoose";

const ROOM_EXPIRY_HOURS = 2;
const MAX_DISTANCE_KM = 5;

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const createRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, title, tags, latitude, longitude } = req.body;

    if (!userId || !title || !latitude || !longitude) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ROOM_EXPIRY_HOURS);

    const room = new Room({
      title: title.trim(),
      tags: tags || [],
      creator: userId,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      members: [userId],
      expiresAt,
    });

    await room.save();

    res.status(201).json({
      roomId: room._id,
      title: room.title,
      tags: room.tags,
      creator: room.creator,
      location: room.location,
      memberCount: room.members.length,
      expiresAt: room.expiresAt,
      createdAt: room.createdAt,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
};

export const getNearbyRooms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, latitude, longitude } = req.query;

    if (!userId || !latitude || !longitude) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const rooms = await Room.find({
      expiresAt: { $gt: new Date() },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(longitude as string),
              parseFloat(latitude as string),
            ],
          },
          $maxDistance: MAX_DISTANCE_KM * 1000,
        },
      },
    })
      .populate("creator", "username")
      .sort({ createdAt: -1 });

    const roomsWithDetails = rooms.map((room) => {
      const distance = calculateDistance(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        room.location.coordinates[1],
        room.location.coordinates[0]
      );

      return {
        roomId: room._id,
        title: room.title,
        tags: room.tags,
        creator: room.creator,
        memberCount: room.members.length,
        distance: parseFloat(distance.toFixed(2)),
        expiresAt: room.expiresAt,
        createdAt: room.createdAt,
      };
    });

    res.json({ rooms: roomsWithDetails });
  } catch (error) {
    console.error("Get nearby rooms error:", error);
    res.status(500).json({ error: "Failed to fetch nearby rooms" });
  }
};

export const joinRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roomId } = req.body;

    if (!userId || !roomId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    if (room.expiresAt < new Date()) {
      res.status(410).json({ error: "Room has expired" });
      return;
    }

    if (!room.members.includes(new mongoose.Types.ObjectId(userId))) {
      room.members.push(new mongoose.Types.ObjectId(userId));
      await room.save();
    }

    res.json({ success: true, roomId: room._id });
  } catch (error) {
    console.error("Join room error:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
};

export const getRoomDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId)
      .populate("creator", "username")
      .populate("members", "username");

    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    if (room.expiresAt < new Date()) {
      res.status(410).json({ error: "Room has expired" });
      return;
    }

    res.json({
      roomId: room._id,
      title: room.title,
      tags: room.tags,
      creator: room.creator,
      members: room.members,
      memberCount: room.members.length,
      expiresAt: room.expiresAt,
      createdAt: room.createdAt,
    });
  } catch (error) {
    console.error("Get room details error:", error);
    res.status(500).json({ error: "Failed to fetch room details" });
  }
};
