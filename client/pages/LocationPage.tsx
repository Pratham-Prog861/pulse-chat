import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAppStore } from "../store/useAppStore";

const LocationPage: React.FC = () => {
  const navigate = useNavigate();
  const setLocation = useAppStore((state) => state.setLocation);
  const setLocationPermission = useAppStore(
    (state) => state.setLocationPermission
  );
  const createUser = useAppStore((state) => state.createUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAllowAccess = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setLocation(locationData);
          setLocationPermission(true);

          // Create user with location
          await createUser(locationData.latitude, locationData.longitude);

          setIsLoading(false);
          navigate("/rooms");
        } catch (err) {
          console.error("Failed to create user:", err);
          setError("Failed to initialize user. Please try again.");
          setIsLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setIsLoading(false);
        setError(
          "Unable to retrieve your location. Please check browser settings."
        );
      }
    );
  };

  const MAP_BG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAxJT1_lqFWMb76dy43cvKLKTh95AsMtiGdfbUGKoIAR2HRSRVI-YdtIfu2aCQQpM-6GXkBV3H_eGTj_qG6ClLQQBywoZmVYlcFYGKcrIdzayYX4alNdyrHZbBwdjvKu7qWHr2GYUnCX93wTMmZxyUgyK6m-I_-hM3BWFZz7nrE9VizAfnJRBNe_nCqKePX0LqOI-Iax2LeadWOTkbshehZAoMJowTPM0IIdQVt4SildXmWidImH8bUf2dNUSAoiyFaVzAoTOXC";

  return (
    <Layout>
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-[#282e39] bg-background-light/80 dark:bg-[#111318]/80 backdrop-blur-md px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            <span className="material-symbols-outlined text-[20px]">radar</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Pulse Chat
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 dark:text-gray-400">
            Anonymous Chat
          </span>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 lg:px-8">
        <div className="flex flex-col max-w-[1024px] w-full gap-12 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Column: Hero Text & Action */}
          <div className="flex flex-col gap-8 lg:max-w-[480px] z-10">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary border border-primary/20">
                <span className="material-symbols-outlined text-[16px]">
                  public
                </span>
                Public Rooms
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] lg:text-5xl text-slate-900 dark:text-white">
                Find your local pulse instantly.
              </h1>
              <p className="text-lg font-normal leading-relaxed text-slate-600 dark:text-gray-400">
                Connect with anonymous chats happening around you right now. We
                use your approximate location to show you relevant rooms.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleAllowAccess}
                disabled={isLoading}
                className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-blue-600 hover:shadow-primary/40 active:scale-[0.98] sm:w-auto disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">
                    refresh
                  </span>
                ) : (
                  <span className="material-symbols-outlined">near_me</span>
                )}
                <span>
                  {isLoading ? "Locating..." : "Allow Location Access"}
                </span>
              </button>
              {error && <p className="text-red-400 text-sm pl-1">{error}</p>}
              <p className="text-xs text-slate-500 dark:text-gray-500 text-center sm:text-left pl-1">
                Your browser will ask for permission. Click "Allow" to continue.
              </p>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] p-3 shadow-sm">
                <span className="material-symbols-outlined text-primary mt-0.5">
                  security
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    100% Anonymous
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    No identity linking
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] p-3 shadow-sm">
                <span className="material-symbols-outlined text-primary mt-0.5">
                  history_toggle_off
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    No History
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    Auto-deleted daily
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual/Illustration */}
          <div className="relative flex w-full flex-1 items-center justify-center lg:h-[600px] lg:justify-end">
            {/* Background Glow Effects */}
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]"></div>

            {/* Phone Mockup / Card Container */}
            <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-gray-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] p-8 shadow-2xl w-full max-w-sm mx-auto lg:mr-0 z-10">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#282e39] pb-4">
                <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-[#282e39]"></div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              {/* Map Illustration Area */}
              <div
                className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-900"
                style={{
                  backgroundImage: `url('${MAP_BG}')`,
                  backgroundSize: "cover",
                  opacity: 0.8,
                }}
              >
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                {/* Pulse Ring Animation */}
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <div className="absolute h-full w-full rounded-full border-2 border-primary bg-primary/20 animate-pulse-ring"></div>
                  <div
                    className="absolute h-full w-full rounded-full border-2 border-primary bg-primary/20 animate-pulse-ring"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/50">
                    <span className="material-symbols-outlined text-[24px]">
                      location_on
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="flex flex-col gap-3 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  New York City
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400">
                    1,240 people online nearby
                  </p>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-[#111318] p-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">
                        music_note
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold dark:text-white">
                        Brooklyn Underground
                      </p>
                      <p className="text-xs text-gray-500">Live • 84 active</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">
                      chevron_right
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-[#111318] p-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">
                        code
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold dark:text-white">
                        Tech Talks NY
                      </p>
                      <p className="text-xs text-gray-500">Live • 126 active</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">
                      chevron_right
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 w-full max-w-[1024px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Why Pulse Chat?
            </h2>
            <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
              Connect with people nearby without compromising your privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] p-6 transition-all hover:shadow-xl hover:border-primary/50">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl transition-all group-hover:bg-primary/10"></div>
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <span className="material-symbols-outlined text-[28px]">
                    bolt
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Instant Connection
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Find and join active chat rooms around you in seconds. No
                  sign-up, no hassle.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] p-6 transition-all hover:shadow-xl hover:border-purple-500/50">
              <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/5 rounded-full blur-3xl transition-all group-hover:bg-purple-500/10"></div>
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 mb-4">
                  <span className="material-symbols-outlined text-[28px]">
                    visibility_off
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Completely Anonymous
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  No email, phone, or personal info required. Your identity
                  stays private.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] p-6 transition-all hover:shadow-xl hover:border-cyan-500/50">
              <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-3xl transition-all group-hover:bg-cyan-500/10"></div>
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 mb-4">
                  <span className="material-symbols-outlined text-[28px]">
                    timer
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Temporary Rooms
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  All rooms expire after 2 hours. Messages disappear
                  automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternate Action Panel */}
        <div className="mt-16 w-full max-w-[1024px]">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-[#282e39] bg-white dark:bg-[#111318] p-8 lg:p-10">
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex flex-col gap-2 max-w-xl">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Not ready to share location?
                </h3>
                <p className="text-slate-600 dark:text-gray-400">
                  No problem. You can still browse our global public rooms,
                  though you won't see chats specific to your neighborhood.
                </p>
              </div>
              <button
                onClick={() => navigate("/rooms")}
                className="group flex items-center gap-2 rounded-lg border border-gray-200 dark:border-[#3b4354] bg-transparent px-5 py-3 text-sm font-bold text-slate-900 dark:text-white transition-colors hover:bg-gray-50 dark:hover:bg-[#282e39]"
              >
                Browse Global Rooms
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
            {/* Subtle background decoration */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-[#282e39] bg-background-light dark:bg-[#111318] py-8 text-center">
        <div className="mx-auto flex max-w-[960px] flex-col gap-6 px-5">
          <div className="flex flex-wrap items-center justify-center gap-6 md:justify-center text-sm">
            <a
              className="text-slate-500 hover:text-slate-900 dark:text-[#9da6b9] dark:hover:text-white transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <span className="hidden h-1 w-1 rounded-full bg-gray-300 dark:bg-[#3b4354] md:block"></span>
            <a
              className="text-slate-500 hover:text-slate-900 dark:text-[#9da6b9] dark:hover:text-white transition-colors"
              href="#"
            >
              Terms of Service
            </a>
          </div>
          <p className="text-xs text-slate-400 dark:text-[#6b7280]">
            © 2024 Pulse Chat. Designed with privacy in mind.
          </p>
        </div>
      </footer>
    </Layout>
  );
};

export default LocationPage;
