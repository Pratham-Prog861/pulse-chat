import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAppStore } from "../store/useAppStore";
import { roomApi } from "../services/api";

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const location = useAppStore((state) => state.location);

  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    if (!user || !location) {
      setError("User or location not available");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await roomApi.createRoom(
        user.id,
        roomName.trim(),
        [],
        location.latitude,
        location.longitude
      );

      navigate(`/chat/${response.roomId}`);
    } catch (err: any) {
      console.error("Failed to create room:", err);
      setError(err.response?.data?.error || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const AVATAR_IMG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAP1bNm5BajgAyL79ZBBWGgHa1RKScg3fpQ9UQgI9zlRSIDGhQMXenSJZojBSHy5T2wCo_pBGYIo6gaBlHa3WwKOZcQaHmXuYTvFMuNDFuh0K-1y1cAwx173J0l2FyxBePM21XQ8dzhLpuR7AvIjXbkUEo7XmSF-Q4ZydSNFhHvKL4bMX-hEG2BM95pQsYmh0wdxZ9gahLAhFKJotvxonJMb0z3MmF9Lwlc1nfnXu1BhhBA4nS60ntI3sCDwujgA8QTO4tpkfFg";

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white antialiased overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen opacity-50"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen opacity-30"></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md px-10 py-3 sticky top-0 z-50">
        <div
          onClick={() => navigate("/rooms")}
          className="flex items-center gap-4 text-slate-900 dark:text-white cursor-pointer"
        >
          <div className="size-8 text-primary">
            <svg
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            Pulse Chat
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">help</span>
            <span className="text-sm font-medium hidden sm:block">Help</span>
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white/10"
            style={{ backgroundImage: `url('${AVATAR_IMG}')` }}
          ></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-[580px] flex flex-col items-center">
          {/* Main Card */}
          <div className="w-full bg-white dark:bg-card-dark/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-8 sm:p-10 relative overflow-hidden group">
            {/* Decorative subtle gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-primary to-purple-500"></div>

            <div className="flex flex-col gap-8">
              {/* Header Section */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 dark:bg-primary/20 text-primary mb-2">
                  <span className="material-symbols-outlined text-3xl">
                    add_location_alt
                  </span>
                </div>
                <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Start a Pulse
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-relaxed max-w-sm mx-auto">
                  Create a temporary room for people nearby. It vanishes in 24
                  hours.
                </p>
              </div>

              {/* Form Section */}
              <div className="flex flex-col gap-6">
                {/* Location Badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary text-lg">
                      my_location
                    </span>
                    <span>
                      Detected Location:{" "}
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {location?.city || "Your Location"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Input Field */}
                <div className="space-y-2">
                  <label
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1"
                    htmlFor="room-name"
                  >
                    Room Name
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within/input:text-primary transition-colors">
                        chat_bubble
                      </span>
                    </div>
                    <input
                      id="room-name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="block w-full rounded-xl border-0 py-4 pl-12 pr-4 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-primary bg-slate-50 dark:bg-slate-900/50 sm:text-base sm:leading-6 transition-all duration-200 ease-in-out"
                      placeholder="e.g., Late Night Coffee Run..."
                      type="text"
                    />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                    Visible to anyone within 1 mile radius.
                  </p>
                  {error && (
                    <p className="text-xs text-red-500 ml-1">{error}</p>
                  )}
                </div>

                {/* Additional Options */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors group/btn"
                  >
                    <span className="material-symbols-outlined text-lg text-slate-400 dark:text-slate-500 group-hover/btn:text-primary transition-colors">
                      lock
                    </span>
                    Make Private
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors group/btn"
                  >
                    <span className="material-symbols-outlined text-lg text-slate-400 dark:text-slate-500 group-hover/btn:text-purple-500 transition-colors">
                      timer
                    </span>
                    2h Duration
                  </button>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    onClick={handleCreate}
                    disabled={loading || !roomName.trim()}
                    className="w-full relative isolate flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-white shadow-lg shadow-primary/30 hover:bg-blue-600 hover:shadow-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">bolt</span>
                        Create Room
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer / Cancel */}
          <div className="mt-8">
            <button
              onClick={() => navigate("/rooms")}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors flex items-center gap-1 group/cancel px-4 py-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-lg group-hover/cancel:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Cancel and return to lobby
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateRoomPage;
