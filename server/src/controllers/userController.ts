import { Request, Response } from "express";
import { User } from "../models/index.js";

const adjectives = [
  "Cool",
  "Swift",
  "Brave",
  "Quiet",
  "Bright",
  "Bold",
  "Calm",
  "Wise",
  "Kind",
  "Noble",
];
const animals = [
  "Tiger",
  "Eagle",
  "Wolf",
  "Fox",
  "Bear",
  "Hawk",
  "Lion",
  "Panda",
  "Owl",
  "Deer",
];

const generateUsername = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${animal}${number}`;
};

export const createAnonymousUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({ error: "Location is required" });
      return;
    }

    const username = generateUsername();

    const user = new User({
      username,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    await user.save();

    res.status(201).json({
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    console.error("Create anonymous user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, username } = req.body;

    if (!userId || !username) {
      res.status(400).json({ error: "User ID and username are required" });
      return;
    }

    if (username.length > 20 || username.length < 3) {
      res
        .status(400)
        .json({ error: "Username must be between 3 and 20 characters" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username: username.trim() },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    console.error("Update username error:", error);
    res.status(500).json({ error: "Failed to update username" });
  }
};
