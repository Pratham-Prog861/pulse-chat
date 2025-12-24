import { io, Socket } from "socket.io-client";

// In a real app, this would be process.env.VITE_API_URL
const SOCKET_URL = "http://localhost:3000";

class SocketService {
  public socket: Socket | null = null;
  private connectionPromise: Promise<void> | null = null;
  public isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect() {
    // If already connected, resolve immediately
    if (this.socket?.connected) {
      this.isConnected = true;
      return Promise.resolve();
    }

    // If connection is in progress, return existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Create new connection
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.socket.on("connect", () => {
        console.log("✅ Socket connected:", this.socket?.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        this.isConnected = false;

        // Auto-reconnect if not intentional disconnect
        if (reason === "io server disconnect") {
          this.socket?.connect();
        }
      });

      this.socket.on("connect_error", (error) => {
        console.error("⚠️ Socket connection error:", error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("Max reconnection attempts reached");
          this.connectionPromise = null;
          reject(error);
        }
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on("reconnect_attempt", (attemptNumber) => {
        console.log("🔄 Attempting to reconnect...", attemptNumber);
      });

      this.socket.on("reconnect_failed", () => {
        console.error("❌ Reconnection failed");
        this.connectionPromise = null;
        reject(new Error("Reconnection failed"));
      });
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
      this.isConnected = false;
    }
  }

  async ensureConnected(): Promise<boolean> {
    if (this.socket?.connected) {
      return true;
    }

    try {
      await this.connect();
      return this.socket?.connected || false;
    } catch (error) {
      console.error("Failed to ensure connection:", error);
      return false;
    }
  }

  async joinRoom(roomId: string, userId: string): Promise<boolean> {
    const connected = await this.ensureConnected();
    if (!connected) {
      console.error("Cannot join room - socket not connected");
      return false;
    }

    console.log("📥 Joining room:", roomId);
    this.socket!.emit("joinRoom", { roomId, userId });
    return true;
  }

  leaveRoom(roomId: string) {
    if (!this.socket?.connected) return;
    console.log("📤 Leaving room:", roomId);
    this.socket.emit("leaveRoom", { roomId });
  }

  async sendMessage(
    roomId: string,
    data: { userId: string; content: string }
  ): Promise<boolean> {
    const connected = await this.ensureConnected();
    if (!connected) {
      console.error("❌ Cannot send message - socket not connected");
      return false;
    }

    console.log("📤 Sending message:", data.content.substring(0, 30) + "...");
    this.socket!.emit("sendMessage", { roomId, ...data });
    return true;
  }

  // New: Typing Indicators
  sendTyping(roomId: string, username: string) {
    this.socket?.emit("typing", { roomId, username });
  }

  sendStopTyping(roomId: string, username: string) {
    this.socket?.emit("stopTyping", { roomId, username });
  }

  // New: Reactions
  sendReaction(roomId: string, messageId: string, emoji: string) {
    this.socket?.emit("reactionAdded", { roomId, messageId, emoji });
  }
}

export const socketService = new SocketService();
