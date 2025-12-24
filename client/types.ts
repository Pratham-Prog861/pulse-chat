export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string; // Optional derived data
}

export interface Room {
  id: string;
  name: string;
  distance: number; // in km
  usersCount: number;
  expiresAt: string; // ISO string
  createdAt: string; // ISO string
  isPrivate: boolean;
  type: "coffee" | "study" | "game" | "music" | "generic"; // For icon selection
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[]; // List of user IDs who reacted
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
  avatarUrl?: string;
  isSystem?: boolean;
  type?: "text" | "system";
  reactions?: Reaction[];
  isPending?: boolean; // Message being sent
  isFailed?: boolean; // Message failed to send
}
