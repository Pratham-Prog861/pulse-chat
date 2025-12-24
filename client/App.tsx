import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import JoinPage from "./pages/JoinPage";
import LocationPage from "./pages/LocationPage";
import RoomsPage from "./pages/RoomsPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import ExpiredPage from "./pages/ExpiredPage";
import { useAppStore } from "./store/useAppStore";
import { socketService } from "./services/socket";

// Protected Route wrapper to ensure user and permission exist
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const user = useAppStore((state) => state.user);
  // In a strict flow, we would check permission too, but for demo navigation flexibility:
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App: React.FC = () => {
  // Initialize socket connection on app load
  useEffect(() => {
    console.log("🚀 Initializing socket connection...");
    socketService.connect().catch((error) => {
      console.error("Failed to initialize socket:", error);
    });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting socket...");
      socketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinPage />} />
        <Route
          path="/location"
          element={
            <ProtectedRoute>
              <LocationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:roomId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expired"
          element={
            <ProtectedRoute>
              <ExpiredPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
