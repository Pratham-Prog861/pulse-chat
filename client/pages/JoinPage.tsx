import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { initializeUserIfNeeded, useAppStore } from "../store/useAppStore";

const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const updateUsername = useAppStore((state) => state.updateUsername);

  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    initializeUserIfNeeded();
  }, []);

  // Sync input with user state initially or when user loads
  useEffect(() => {
    if (user && !usernameInput) {
      setUsernameInput(user.username);
    }
  }, [user]);

  const validateUsername = (name: string): string | null => {
    if (name.length < 3) return "Minimum 3 characters required";
    if (name.length > 16) return "Maximum 16 characters allowed";
    if (!/^[a-zA-Z0-9_]+$/.test(name))
      return "Only letters, numbers, and underscores";
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsernameInput(val);
    setError(validateUsername(val));
  };

  const handleRefreshIdentity = () => {
    const randomNum = Math.floor(Math.random() * 9999);
    const adjectives = [
      "Neon",
      "Cyber",
      "Silent",
      "Swift",
      "Solar",
      "Lunar",
      "Arctic",
      "Velvet",
    ];
    const nouns = [
      "Fox",
      "Owl",
      "Wolf",
      "Ghost",
      "Echo",
      "Ray",
      "Tiger",
      "Storm",
    ];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    // Generate new compliant username
    const newUsername = `${adj}${noun}_${randomNum}`;

    if (user) {
      const updatedUser = {
        ...user,
        username: newUsername,
        avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${randomNum}`,
      };
      setUser(updatedUser);
      setUsernameInput(newUsername);
      setError(null);
    }
  };

  const handleContinue = () => {
    // Final validation check
    const validationError = validateUsername(usernameInput);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Save manual username
    updateUsername(usernameInput);

    setIsAnimating(true);
    setTimeout(() => {
      navigate("/location");
    }, 400);
  };

  // No loading needed - user is created synchronously
  if (!user) return null;

  // Image used in the design
  const AVATAR_IMG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDlQ7wzTnFjdV9cFSqmfjTdD9j5cmYJ7IphtROcx9nWPztao1b_eDeRnnDHhbp1F57L2vHL1XEtk74Kwjei6HiBB7O0qwMlhjeTrDmgtZTilEnfF-JtsZ7H8i-8cIiRVnR8NchLSp4m9Swv4Mz6G8oSvalVTnVPS0WnGv2TU4jrelZvEyO4yQDgn_WgSTDVZaVyIG3mhvQOrZ1wW7iJ61rXGxWIIK-K6J-dZkKmNyp8ugOjB62ColObQtcCgfe-GhD_bCWLaPHa";

  return (
    <Layout>
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {/* Logo Section */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="material-symbols-outlined text-white text-2xl font-bold">
                bolt
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-slate-900 dark:text-white">Pulse</span>
              <span className="pulse-gradient-text">Chat</span>
            </h1>
          </div>

          {/* Central Card */}
          <div className="w-full relative bg-white/80 dark:bg-[#111318]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/5 p-6 sm:p-8 overflow-hidden">
            {/* Border Glow Effect (CSS trick simulation) */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl border border-transparent [mask:linear-gradient(#fff_0_0) content-box,linear-gradient(#fff_0_0)]">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-400/30 to-purple-600/30 opacity-50"></div>
            </div>

            {/* Avatar & Identity Section */}
            <div className="flex flex-col items-center gap-6 mb-8">
              {/* Avatar Image */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#1e232e] bg-slate-800 shadow-inner">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${user.avatarUrl || AVATAR_IMG}')`,
                    }}
                  ></div>
                </div>
                <div
                  className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-[#1e232e] rounded-full flex items-center justify-center"
                  title="Online"
                >
                  <span className="sr-only">Status Online</span>
                </div>
              </div>

              {/* Identity Info */}
              <div className="text-center w-full max-w-xs mx-auto">
                <p className="text-slate-500 dark:text-[#9da6b9] text-sm font-medium mb-3 tracking-wide uppercase">
                  Your anonymous identity is
                </p>

                <div className="relative group/edit mb-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={handleInputChange}
                      className={`
                              w-full bg-slate-100 dark:bg-slate-800/50 border-2 
                              ${
                                error
                                  ? "border-red-400 focus:border-red-500"
                                  : "border-transparent focus:border-primary/50"
                              } 
                              ${
                                !error && usernameInput.length >= 3
                                  ? "border-green-400/30"
                                  : ""
                              }
                              rounded-xl py-3 pl-4 pr-12 text-center text-xl sm:text-2xl font-bold 
                              text-slate-900 dark:text-white tracking-tight 
                              focus:outline-none focus:ring-0 transition-all placeholder:text-slate-400
                          `}
                      placeholder="Choose username"
                      maxLength={16}
                    />

                    {/* Refresh / Status Icon */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                      <button
                        onClick={handleRefreshIdentity}
                        className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Generate new random name"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          refresh
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Validation Feedback */}
                  <div className="h-6 mt-1 flex items-center justify-center text-xs font-medium">
                    {error ? (
                      <span className="text-red-500 flex items-center gap-1 animate-fadeIn">
                        <span className="material-symbols-outlined text-[14px]">
                          error
                        </span>
                        {error}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        This username is anonymous and can be changed later.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-4">
              <button
                onClick={handleContinue}
                disabled={!!error || !usernameInput}
                className={`
                    w-full relative overflow-hidden group bg-primary hover:bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]
                    ${
                      !!error || !usernameInput
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : ""
                    }
                `}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="flex items-center justify-center gap-2 relative z-10">
                  Continue to Chat
                  <span className="material-symbols-outlined text-[20px] font-bold">
                    arrow_forward
                  </span>
                </span>
              </button>
            </div>

            {/* Helper Text */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-3 px-2">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 shrink-0 mt-0.5 text-lg">
                  shield_lock
                </span>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9da6b9] leading-relaxed">
                  Your chats are temporary, encrypted, and location-based. No
                  history is saved once you leave the session.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex gap-6 text-sm text-slate-400 dark:text-slate-600 font-medium">
            <a
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
              href="#"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JoinPage;
