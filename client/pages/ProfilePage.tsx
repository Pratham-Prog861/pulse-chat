import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const updateUsername = useAppStore((state) => state.updateUsername);

  const [username, setUsername] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!username.trim() || username === user?.username) {
      navigate(-1);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await updateUsername(username.trim());
      navigate(-1);
    } catch (err: any) {
      console.error("Failed to update username:", err);
      setError(err.response?.data?.error || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const AVATAR_IMG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCW-_NevwHqe-B8zaXIVpwuXurEyjoQd_6n-R-GIyUxmxl76H-X4DMXj-DiI50xxCw32ND0K3tBQT2szTgpsa-EZ3oe2N2GMr49HdbQzgnyjwFgNc7eAN9PDi-HKTIVNwHRfVALYsIkUB77S2TM_9zvGiodXYf7p3rfieU0D0txeX_tpBpiJ0wzT60ZVXMOHhvnOCqoPlSxjkHVT5olJdiWZbSBUZ7GZzEIqkSnLg67uGpZF2LzdIwgo8w0JI2U6w6JkTF__NET";

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-slate-900 dark:text-white antialiased overflow-x-hidden font-display">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-[#111318]/80 border-b border-gray-200 dark:border-border-dark px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => navigate("/rooms")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="size-8 text-primary">
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
              Pulse Chat
            </h2>
          </div>
          <button className="flex items-center justify-center rounded-xl size-10 bg-gray-100 dark:bg-border-dark text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 relative">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[100px] rounded-full opacity-50"></div>
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/10 blur-[80px] rounded-full opacity-30"></div>
          <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-600/10 blur-[90px] rounded-full opacity-30"></div>
        </div>

        {/* Profile Card */}
        <div className="relative z-10 w-full max-w-[480px]">
          <div className="bg-white/80 dark:bg-surface-dark/90 backdrop-blur-xl border border-gray-200 dark:border-border-dark rounded-2xl shadow-lg shadow-primary/5 overflow-hidden">
            {/* Card Header / Avatar Area */}
            <div className="flex flex-col items-center pt-10 pb-6 px-8 text-center relative">
              {/* Avatar Glow */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/40 blur-2xl rounded-full"></div>
              {/* Avatar Image */}
              <div
                className="relative size-32 rounded-full border-4 border-white dark:border-[#1c1f27] shadow-xl bg-gray-200 dark:bg-gray-800 bg-center bg-cover mb-5"
                style={{ backgroundImage: `url('${AVATAR_IMG}')` }}
              >
                {/* Edit Avatar Button */}
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white hover:bg-primary-hover border-4 border-white dark:border-[#1c1f27] transition-colors shadow-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    photo_camera
                  </span>
                </button>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                @{username}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex size-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-slate-500 dark:text-[#9da6b9] text-sm font-medium">
                  Online now
                </p>
              </div>
              <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-lg border border-primary/20">
                <p className="text-primary dark:text-blue-400 text-xs font-semibold tracking-wide uppercase">
                  ID resets in 14h 32m
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="px-8 pb-10">
              <div className="flex flex-col gap-6">
                {/* Headline */}
                <div className="text-center">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                    Edit Display Name
                  </h3>
                  <p className="text-slate-500 dark:text-[#9da6b9] text-sm mt-1">
                    Choose a new name to identify yourself in local chats.
                  </p>
                </div>

                {/* Input Field */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-slate-700 dark:text-white text-sm font-semibold ml-1"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined">
                        alternate_email
                      </span>
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full rounded-xl border-gray-300 dark:border-border-dark bg-gray-50 dark:bg-[#111318] text-slate-900 dark:text-white pl-11 pr-4 py-3.5 focus:border-primary focus:ring-primary focus:ring-1 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600 sm:text-sm font-medium"
                      placeholder="Enter new username"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-green-500 text-[20px]">
                        check_circle
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-500 ml-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      lock
                    </span>
                    Visible only to nearby users
                  </p>
                  {error && (
                    <p className="text-xs text-red-500 ml-1">{error}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={loading || !username.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full text-slate-600 dark:text-[#9da6b9] hover:text-slate-900 dark:hover:text-white font-medium py-3 px-4 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Footer Note */}
          <p className="text-center text-xs text-slate-400 dark:text-gray-600 mt-6 max-w-xs mx-auto">
            Pulse Chat prioritizes your privacy. Your identity is never stored
            permanently.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
