import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Room } from "../types";
import { roomApi } from "../services/api";
import { useAppStore } from "../store/useAppStore";

const RoomsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const location = useAppStore((state) => state.location);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user || !location) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await roomApi.getNearbyRooms(
          user.id,
          location.latitude,
          location.longitude
        );

        // Transform backend response to frontend Room format
        const transformedRooms: Room[] = response.rooms.map((room: any) => ({
          id: room.roomId,
          name: room.title,
          distance: room.distance,
          usersCount: room.memberCount,
          expiresAt: room.expiresAt,
          createdAt: room.createdAt,
          isPrivate: false,
          type: "generic" as const,
        }));

        setRooms(transformedRooms);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
        setError("Failed to load nearby rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Refresh rooms every 30 seconds
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, [user, location]);

  const getIconData = (type: Room["type"]) => {
    switch (type) {
      case "coffee":
        return {
          icon: "coffee",
          bg: "bg-primary/10",
          text: "text-primary",
          hoverBg: "group-hover:bg-primary",
        };
      case "music":
        return {
          icon: "music_note",
          bg: "bg-purple-500/10",
          text: "text-purple-400",
          hoverBg: "group-hover:bg-purple-600",
        };
      case "study":
        return {
          icon: "menu_book",
          bg: "bg-cyan-500/10",
          text: "text-cyan-400",
          hoverBg: "group-hover:bg-cyan-600",
        };
      case "game":
        return {
          icon: "sports_esports",
          bg: "bg-pink-500/10",
          text: "text-pink-400",
          hoverBg: "group-hover:bg-pink-600",
        };
      default:
        return {
          icon: "chat_bubble",
          bg: "bg-slate-500/10",
          text: "text-slate-400",
          hoverBg: "group-hover:bg-slate-600",
        };
    }
  };

  const getTimerColor = (minutesLeft: number) => {
    if (minutesLeft < 30)
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/20",
      };
    if (minutesLeft < 60)
      return {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/20",
      };
    return {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
    };
  };

  const calculateTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const mins = Math.max(0, Math.floor(diff / 60000));
    return {
      mins,
      str: mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`,
    };
  };

  return (
    <Layout>
      {/* Top Navbar */}
      <header className="glass-header sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-6 py-4 lg:px-40 border-b border-white/5 bg-[#101622]/70 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-white">
          <div className="size-8 flex items-center justify-center text-primary bg-primary/10 rounded-full">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "24px" }}
            >
              graphic_eq
            </span>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight tracking-tight">
            Pulse Chat
          </h2>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full hover:bg-white/10 transition-colors text-white"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full max-w-[800px] flex-1 gap-8">
          {/* Page Heading */}
          <div className="flex flex-col gap-2 px-2 animate-fadeIn">
            <h1 className="text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight">
              Nearby Pulses
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-normal leading-normal max-w-lg">
              Discover active, anonymous chat rooms within your vicinity. Join
              the conversation before time runs out.
            </p>
          </div>

          {/* Rooms List */}
          <div className="flex flex-col gap-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {error && (
              <div className="glass-panel p-5 rounded-2xl text-center">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {!loading && !error && rooms.length === 0 && (
              <div className="glass-panel p-8 rounded-2xl text-center">
                <span className="material-symbols-outlined text-slate-500 text-6xl mb-4">
                  search_off
                </span>
                <p className="text-slate-400">No active rooms nearby</p>
                <p className="text-slate-500 text-sm mt-2">
                  Be the first to create one!
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              rooms.map((room) => {
                const styles = getIconData(room.type);
                const timeLeft = calculateTimeLeft(room.expiresAt);
                const timerStyles = getTimerColor(timeLeft.mins);

                return (
                  <div
                    key={room.id}
                    onClick={() => navigate(`/chat/${room.id}`)}
                    className="glass-panel group p-5 rounded-2xl hover:bg-[#1e2330]/80 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`${styles.text} ${styles.bg} flex items-center justify-center rounded-xl shrink-0 size-14 ${styles.hoverBg} group-hover:text-white transition-colors duration-300`}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "28px" }}
                          >
                            {styles.icon}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-white text-lg font-semibold leading-tight">
                              {room.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${timerStyles.bg} ${timerStyles.text} ${timerStyles.border}`}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "14px" }}
                              >
                                timer
                              </span>
                              {timeLeft.str} left
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-slate-400 text-sm">
                            <span className="flex items-center gap-1">
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "16px" }}
                              >
                                location_on
                              </span>
                              {room.distance}km away
                            </span>
                            <span className="flex items-center gap-1">
                              <span
                                className="material-symbols-outlined text-green-400"
                                style={{
                                  fontSize: "16px",
                                  fontVariationSettings: "'FILL' 1",
                                }}
                              >
                                circle
                              </span>
                              {room.usersCount} Online
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto mt-2 sm:mt-0">
                        <button className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-10 px-5 bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-white text-sm font-semibold transition-all shadow-sm group-hover:shadow-md">
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Empty State Message */}
          {!loading && !error && rooms.length > 0 && (
            <div className="flex items-center justify-center py-8 opacity-40">
              <p className="text-slate-500 text-sm">
                Looking for more pulses nearby...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FAB: Create Room */}
      <div className="fixed bottom-8 right-6 z-40 md:right-12 md:bottom-12">
        <button
          onClick={() => navigate("/create")}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white rounded-full px-6 py-4 shadow-[0_0_25px_rgba(19,91,236,0.4)] hover:shadow-[0_0_35px_rgba(19,91,236,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-95 group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
            add
          </span>
          <span className="font-bold text-base whitespace-nowrap">
            Create Room
          </span>
        </button>
      </div>
    </Layout>
  );
};

export default RoomsPage;
