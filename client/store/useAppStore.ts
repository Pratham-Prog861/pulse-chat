import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, LocationData } from "../types";
import { userApi } from "../services/api";

interface AppState {
  user: User | null;
  location: LocationData | null;
  locationPermissionGranted: boolean;

  // Actions
  setUser: (user: User) => void;
  createUser: (latitude: number, longitude: number) => Promise<void>;
  updateUsername: (name: string) => Promise<void>;
  setLocation: (loc: LocationData) => void;
  setLocationPermission: (granted: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      location: null,
      locationPermissionGranted: false,

      setUser: (user) => set({ user }),

      createUser: async (latitude: number, longitude: number) => {
        try {
          const response = await userApi.createAnonymousUser(
            latitude,
            longitude
          );
          const user: User = {
            id: response.userId,
            username: response.username,
            avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${response.username}`,
          };
          set({ user });
        } catch (error) {
          console.error("Failed to create user:", error);
          throw error;
        }
      },

      updateUsername: async (username: string) => {
        const state = get();
        if (!state.user) throw new Error("No user found");

        try {
          await userApi.updateUsername(state.user.id, username);
          set((state) => ({
            user: state.user ? { ...state.user, username } : null,
          }));
        } catch (error) {
          console.error("Failed to update username:", error);
          throw error;
        }
      },

      setLocation: (location) => set({ location }),

      setLocationPermission: (granted) =>
        set({ locationPermissionGranted: granted }),

      logout: () =>
        set({ user: null, location: null, locationPermissionGranted: false }),
    }),
    {
      name: "pulse-chat-storage",
    }
  )
);

// Initialization helper
export const initializeUserIfNeeded = () => {
  const state = useAppStore.getState();
  if (!state.user) {
    // Generate temporary anonymous user for Join page
    const randomNum = Math.floor(Math.random() * 1000);
    const adjectives = ["Neon", "Cyber", "Silent", "Swift", "Solar", "Lunar"];
    const nouns = ["Fox", "Owl", "Wolf", "Ghost", "Echo", "Ray"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    const tempUser = {
      id: crypto.randomUUID(),
      username: `${adj}${noun}_${randomNum}`,
      avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${randomNum}`,
    };

    state.setUser(tempUser);
  }
};
