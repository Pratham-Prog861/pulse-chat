import axios from "axios";

const API_URL = process.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// User API
export const userApi = {
  createAnonymousUser: async (latitude: number, longitude: number) => {
    const response = await api.post("/api/users/anonymous", {
      latitude,
      longitude,
    });
    return response.data;
  },

  updateUsername: async (userId: string, username: string) => {
    const response = await api.put("/api/users/username", { userId, username });
    return response.data;
  },
};

// Room API
export const roomApi = {
  createRoom: async (
    userId: string,
    title: string,
    tags: string[],
    latitude: number,
    longitude: number
  ) => {
    const response = await api.post("/api/rooms", {
      userId,
      title,
      tags,
      latitude,
      longitude,
    });
    return response.data;
  },

  getNearbyRooms: async (
    userId: string,
    latitude: number,
    longitude: number
  ) => {
    const response = await api.get("/api/rooms/nearby", {
      params: { userId, latitude, longitude },
    });
    return response.data;
  },

  getRoomDetails: async (roomId: string) => {
    const response = await api.get(`/api/rooms/${roomId}`);
    return response.data;
  },

  joinRoom: async (userId: string, roomId: string) => {
    const response = await api.post("/api/rooms/join", { userId, roomId });
    return response.data;
  },
};

// Message API
export const messageApi = {
  getRoomMessages: async (roomId: string, limit: number = 50) => {
    const response = await api.get(`/api/messages/${roomId}`, {
      params: { limit },
    });
    return response.data;
  },
};

export default api;
