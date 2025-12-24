import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { Message, Room, User } from "../models/index.js";
import mongoose from "mongoose";

interface MessageData {
  roomId: string;
  userId: string;
  content: string;
}

interface JoinRoomData {
  roomId: string;
  userId: string;
}

export const setupSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const messageRateLimits = new Map<string, number[]>();

  const checkRateLimit = (userId: string): boolean => {
    const now = Date.now();
    const userMessages = messageRateLimits.get(userId) || [];
    const recentMessages = userMessages.filter((time) => now - time < 10000);

    if (recentMessages.length >= 10) {
      return false;
    }

    recentMessages.push(now);
    messageRateLimits.set(userId, recentMessages);
    return true;
  };

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", async ({ roomId, userId }: JoinRoomData) => {
      try {
        const room = await Room.findById(roomId);
        if (!room || room.expiresAt < new Date()) {
          socket.emit("error", { message: "Room not found or expired" });
          return;
        }

        const user = await User.findById(userId);
        if (!user) {
          socket.emit("error", { message: "User not found" });
          return;
        }

        socket.join(roomId);

        io.to(roomId).emit("userJoined", {
          username: user.username,
          memberCount: room.members.length,
        });

        console.log(`User ${user.username} joined room ${roomId}`);
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on(
      "sendMessage",
      async ({ roomId, userId, content }: MessageData) => {
        try {
          if (!checkRateLimit(userId)) {
            socket.emit("error", { message: "Rate limit exceeded" });
            return;
          }

          const room = await Room.findById(roomId);
          if (!room || room.expiresAt < new Date()) {
            socket.emit("roomExpired", { roomId });
            return;
          }

          const user = await User.findById(userId);
          if (!user) {
            socket.emit("error", { message: "User not found" });
            return;
          }

          const message = new Message({
            room: roomId,
            sender: userId,
            content: content.trim(),
            expiresAt: room.expiresAt,
          });

          await message.save();
          await message.populate("sender", "username");

          io.to(roomId).emit("newMessage", {
            messageId: message._id,
            sender: {
              _id: user._id,
              username: user.username,
            },
            content: message.content,
            createdAt: message.createdAt,
          });

          console.log(`Message sent in room ${roomId} by ${user.username}`);
        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    socket.on("leaveRoom", async ({ roomId, userId }: JoinRoomData) => {
      try {
        const user = await User.findById(userId);
        socket.leave(roomId);

        if (user) {
          io.to(roomId).emit("userLeft", {
            username: user.username,
          });
        }

        console.log(`User ${user?.username} left room ${roomId}`);
      } catch (error) {
        console.error("Leave room error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  const checkExpiredRooms = async () => {
    try {
      const expiredRooms = await Room.find({
        expiresAt: { $lte: new Date() },
      });

      for (const room of expiredRooms) {
        io.to(room._id.toString()).emit("roomExpired", { roomId: room._id });

        const sockets = await io.in(room._id.toString()).fetchSockets();
        sockets.forEach((socket) => {
          socket.leave(room._id.toString());
        });
      }
    } catch (error) {
      console.error("Check expired rooms error:", error);
    }
  };

  setInterval(checkExpiredRooms, 60000);

  return io;
};
