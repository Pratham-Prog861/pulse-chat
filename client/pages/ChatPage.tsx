import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { socketService } from "../services/socket";
import { Message, Reaction } from "../types";
import { messageApi, roomApi } from "../services/api";

const SUPPORTED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const user = useAppStore((state) => state.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [isConnected, setIsConnected] = useState(socketService.isConnected);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Calculate time left for room expiration
  useEffect(() => {
    if (!roomDetails?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(roomDetails.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        navigate("/expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(
          `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setTimeLeft(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [roomDetails, navigate]);

  // Fetch room details and messages
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId || !user) return;

      try {
        setLoading(true);

        // Join room first
        await roomApi.joinRoom(user.id, roomId);

        // Fetch room details
        const details = await roomApi.getRoomDetails(roomId);
        setRoomDetails(details);

        // Fetch messages
        const messagesData = await messageApi.getRoomMessages(roomId);

        // Transform backend messages to frontend format
        const transformedMessages: Message[] = messagesData.messages.map(
          (msg: any) => ({
            id: msg._id,
            roomId: roomId,
            userId: msg.sender._id,
            username: msg.sender.username,
            text: msg.content,
            createdAt: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${msg.sender.username}`,
            type: "text",
            reactions: [],
          })
        );

        setMessages(transformedMessages);

        // Connect to socket and join room
        await socketService.connect();
        const joined = await socketService.joinRoom(roomId, user.id);

        if (!joined) {
          console.error("Failed to join room via socket");
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load room:", error);
        navigate("/rooms");
        setLoading(false);
      }
    };

    fetchRoomData();

    return () => {
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
    };
  }, [roomId, user, navigate]);

  // Monitor socket connection status
  useEffect(() => {
    if (!socketService.socket) return;

    const updateConnectionStatus = () => {
      setIsConnected(socketService.socket?.connected || false);
    };

    socketService.socket.on("connect", updateConnectionStatus);
    socketService.socket.on("disconnect", updateConnectionStatus);

    return () => {
      socketService.socket?.off("connect", updateConnectionStatus);
      socketService.socket?.off("disconnect", updateConnectionStatus);
    };
  }, [socketService.socket]);

  // Socket Event Listeners
  useEffect(() => {
    if (!socketService.socket || !user || !roomId) return;

    console.log("Setting up socket listeners for room:", roomId);

    // Listen for incoming messages
    const handleNewMessage = (data: any) => {
      console.log("📨 Received new message:", data);

      setMessages((prev) => {
        // If this is our own message (confirmed by server), replace optimistic message
        if (data.sender._id === user.id) {
          const withoutPending = prev.filter(
            (msg) => !msg.isPending || msg.userId !== user.id
          );

          // Check if we already have this message (avoid duplicates)
          if (withoutPending.some((msg) => msg.id === data.messageId)) {
            return prev;
          }

          const confirmedMsg: Message = {
            id: data.messageId,
            roomId: roomId,
            userId: data.sender._id,
            username: data.sender.username,
            text: data.content,
            createdAt: new Date(data.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${data.sender.username}`,
            type: "text",
            reactions: [],
          };

          return [...withoutPending, confirmedMsg];
        }

        // For other users' messages, just add if not duplicate
        if (prev.some((msg) => msg.id === data.messageId)) {
          return prev;
        }

        const newMsg: Message = {
          id: data.messageId,
          roomId: roomId,
          userId: data.sender._id,
          username: data.sender.username,
          text: data.content,
          createdAt: new Date(data.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${data.sender.username}`,
          type: "text",
          reactions: [],
        };

        return [...prev, newMsg];
      });
    };

    socketService.socket.on("newMessage", handleNewMessage);

    // Listen for user joined
    socketService.socket.on(
      "userJoined",
      ({ username }: { username: string }) => {
        const systemMsg: Message = {
          id: `sys-${Date.now()}`,
          roomId: roomId!,
          userId: "system",
          username: "System",
          text: `${username} has joined the pulse.`,
          createdAt: "",
          isSystem: true,
          type: "system",
        };
        setMessages((prev) => [...prev, systemMsg]);
      }
    );

    // Listen for user left
    socketService.socket.on(
      "userLeft",
      ({ username }: { username: string }) => {
        const systemMsg: Message = {
          id: `sys-${Date.now()}`,
          roomId: roomId!,
          userId: "system",
          username: "System",
          text: `${username} has left the pulse.`,
          createdAt: "",
          isSystem: true,
          type: "system",
        };
        setMessages((prev) => [...prev, systemMsg]);
      }
    );

    // Listen for room expired
    socketService.socket.on("roomExpired", () => {
      navigate("/expired");
    });

    // Listen for typing events
    socketService.socket.on("typing", ({ username }: { username: string }) => {
      if (username === user?.username) return; // Ignore self
      setTypingUsers((prev) => {
        if (!prev.includes(username)) return [...prev, username];
        return prev;
      });
    });

    socketService.socket.on(
      "stopTyping",
      ({ username }: { username: string }) => {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
      }
    );

    // Listen for reactions
    socketService.socket.on(
      "reactionAdded",
      ({
        messageId,
        emoji,
        userId,
      }: {
        messageId: string;
        emoji: string;
        userId: string;
      }) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.id !== messageId) return msg;

            const existingReactions = msg.reactions || [];
            const existingReactionIndex = existingReactions.findIndex(
              (r) => r.emoji === emoji
            );

            if (existingReactionIndex > -1) {
              // Update existing reaction count
              const updatedReactions = [...existingReactions];
              const reaction = updatedReactions[existingReactionIndex];

              // Avoid duplicate count from same user (simple check)
              if (!reaction.userIds.includes(userId)) {
                updatedReactions[existingReactionIndex] = {
                  ...reaction,
                  count: reaction.count + 1,
                  userIds: [...reaction.userIds, userId],
                };
              }
              return { ...msg, reactions: updatedReactions };
            } else {
              // Add new reaction
              return {
                ...msg,
                reactions: [
                  ...existingReactions,
                  { emoji, count: 1, userIds: [userId] },
                ],
              };
            }
          })
        );
      }
    );

    return () => {
      socketService.socket?.off("newMessage");
      socketService.socket?.off("userJoined");
      socketService.socket?.off("userLeft");
      socketService.socket?.off("roomExpired");
      socketService.socket?.off("typing");
      socketService.socket?.off("stopTyping");
      socketService.socket?.off("reactionAdded");
    };
  }, [user, roomId, navigate]);

  // Handle outside click to close picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setActivePickerId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Actions
  const handleSend = async () => {
    if (!inputText.trim() || !user || !roomId) return;

    const messageContent = inputText.trim();

    // Optimistic UI update - add message immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      roomId: roomId,
      userId: user.id,
      username: user.username,
      text: messageContent,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.username}`,
      type: "text",
      reactions: [],
      isPending: true, // Mark as pending
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText("");

    // Send message to backend via socket
    const sent = await socketService.sendMessage(roomId, {
      userId: user.id,
      content: messageContent,
    });

    if (!sent) {
      // If failed, mark message as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, isPending: false, isFailed: true }
            : msg
        )
      );
      console.error("Failed to send message");
    }

    // Clear typing indicator
    socketService.sendStopTyping(roomId, user.username);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    if (!roomId || !user) return;

    // Emit typing event
    socketService.sendTyping(roomId, user.username);

    // Debounce stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendStopTyping(roomId, user.username);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    if (!roomId || !user) return;

    // Optimistic update
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingReactions = msg.reactions || [];
        const reactionIndex = existingReactions.findIndex(
          (r) => r.emoji === emoji
        );

        let newReactions = [...existingReactions];

        if (reactionIndex > -1) {
          const reaction = newReactions[reactionIndex];
          if (reaction.userIds.includes(user.id)) {
            // If user already reacted, usually we toggle off, but prompt mainly asked for adding.
            // For better UX, let's just return if already added or implement toggle.
            // We'll skip adding duplicate locally.
            return msg;
          }
          newReactions[reactionIndex] = {
            ...reaction,
            count: reaction.count + 1,
            userIds: [...reaction.userIds, user.id],
          };
        } else {
          newReactions.push({ emoji, count: 1, userIds: [user.id] });
        }

        return { ...msg, reactions: newReactions };
      })
    );

    socketService.sendReaction(roomId, messageId, emoji);
    setActivePickerId(null);
  };

  // Helper for typing text
  const getTypingText = () => {
    if (typingUsers.length === 0) return "";
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2)
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return `${typingUsers.length} people are typing...`;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-screen w-full overflow-hidden flex text-slate-900 dark:text-white antialiased selection:bg-primary/30 selection:text-white">
      {/* Sidebar (Desktop) */}
      <aside className="w-80 hidden md:flex flex-col border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0e14] h-full z-20">
        <div
          className="p-6 pb-2 cursor-pointer"
          onClick={() => navigate("/rooms")}
        >
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: "28px" }}
            >
              bolt
            </span>
            Pulse Chat
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Anonymous & Local
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div className="space-y-1">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Discover
              </h3>
            </div>
            <button
              onClick={() => navigate("/rooms")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary font-medium cursor-pointer text-left"
            >
              <span className="material-symbols-outlined fill-1">forum</span>
              Current Pulse
            </button>
            <button
              onClick={() => navigate("/rooms")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-left"
            >
              <span className="material-symbols-outlined">location_on</span>
              Nearby
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 py-2 flex justify-between items-center">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nearby Active
              </h3>
              <span className="text-[10px] bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500">
                LIVE
              </span>
            </div>
            <button className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-100 dark:bg-[#1a202c] border border-transparent dark:border-primary/20 relative group">
              <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-green-500"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-sm">
                  coffee
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  Downtown Coffee
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  24 people • <span className="text-primary">15m left</span>
                </p>
              </div>
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-white/5">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 text-sm font-medium"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 relative flex flex-col h-full bg-background-light dark:bg-background-dark">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 h-[72px] z-30 flex items-center justify-between px-4 md:px-8 border-b border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-[#101622]/80 backdrop-blur-md">
          {/* Connection Status Banner */}
          {!isConnected && (
            <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-white text-xs py-1 px-4 text-center">
              ⚠️ Reconnecting to server...
            </div>
          )}

          <div className="flex items-center gap-4 min-w-0">
            <button
              className="md:hidden text-slate-500 dark:text-slate-400"
              onClick={() => navigate("/rooms")}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-slate-900 dark:text-white text-base md:text-lg font-bold leading-tight flex items-center gap-2">
                {loading ? "Loading..." : roomDetails?.title || "Room"}
                <span className="material-symbols-outlined text-slate-400 text-base">
                  verified
                </span>
                {/* Connection indicator dot */}
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                  }`}
                  title={isConnected ? "Connected" : "Connecting..."}
                ></span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {roomDetails?.memberCount || 0} members • Public Room
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <span className="material-symbols-outlined text-[18px]">
                timer
              </span>
              <span className="text-sm font-bold font-mono tracking-wide">
                {timeLeft}
              </span>
            </div>
            <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </header>

        {/* Messages List */}
        <div
          className="flex-1 overflow-y-auto px-4 md:px-8 pt-24 pb-32 space-y-6 scroll-smooth"
          id="chat-container"
        >
          <div className="flex justify-center py-2">
            <span className="text-xs font-medium text-slate-400 bg-slate-200/50 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-300 dark:border-white/5">
              Start of conversation • 2:30 PM
            </span>
          </div>

          {messages.map((msg) => {
            if (msg.isSystem || msg.type === "system") {
              return (
                <div key={msg.id} className="flex justify-center py-2">
                  <p className="text-slate-400 dark:text-[#9da6b9] text-xs md:text-sm font-medium flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary"></span>
                    {msg.text}
                  </p>
                </div>
              );
            }

            const isMe = msg.userId === user?.id || msg.userId === "me";
            // Simple avatar color hash fallback
            const colors = [
              "from-pink-500 to-rose-400",
              "from-cyan-500 to-blue-400",
              "from-purple-500 to-violet-400",
              "from-emerald-500 to-teal-400",
            ];
            const colorClass = colors[msg.userId.length % colors.length];

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-3 group relative ${
                  isMe ? "justify-end" : ""
                }`}
              >
                {/* Other User Avatar */}
                {!isMe && (
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr ${colorClass} shrink-0 shadow-sm`}
                  ></div>
                )}

                <div
                  className={`flex flex-col gap-1 max-w-[80%] md:max-w-[60%] ${
                    isMe ? "items-end" : ""
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      isMe ? "mr-1" : "ml-1"
                    }`}
                  >
                    {isMe && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-600">
                        {msg.createdAt}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {isMe ? "You" : msg.username}
                    </span>
                    {!isMe && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-600">
                        {msg.createdAt}
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`
                                relative p-3 md:p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all
                                ${
                                  isMe
                                    ? "bg-primary text-white rounded-tr-sm shadow-primary/20"
                                    : "bg-white dark:bg-[#282e39] rounded-tl-sm text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-transparent"
                                }
                                ${msg.isPending ? "opacity-60" : ""}
                                ${
                                  msg.isFailed
                                    ? "opacity-50 border-red-500"
                                    : ""
                                }
                            `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1">{msg.text}</span>
                      {msg.isPending && isMe && (
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>
                      )}
                      {msg.isFailed && isMe && (
                        <span
                          className="material-symbols-outlined text-[16px] text-red-400"
                          title="Failed to send"
                        >
                          error
                        </span>
                      )}
                    </div>

                    {/* Emoji Picker Trigger - Visible on Hover or Active */}
                    <button
                      onClick={() =>
                        setActivePickerId(
                          activePickerId === msg.id ? null : msg.id
                        )
                      }
                      className={`
                                    absolute -top-3 ${
                                      isMe ? "-left-3" : "-right-3"
                                    }
                                    w-7 h-7 bg-white dark:bg-[#1c1f27] rounded-full border border-gray-200 dark:border-white/10
                                    flex items-center justify-center text-slate-400 hover:text-yellow-500 hover:scale-110
                                    shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-10
                                    ${
                                      activePickerId === msg.id
                                        ? "opacity-100 scale-110"
                                        : ""
                                    }
                                `}
                      title="Add Reaction"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        add_reaction
                      </span>
                    </button>

                    {/* Emoji Picker Popover */}
                    {activePickerId === msg.id && (
                      <div
                        ref={pickerRef}
                        className={`
                                        absolute bottom-full mb-2 z-50 p-2 flex gap-1
                                        bg-white/90 dark:bg-[#1a202c]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10
                                        rounded-full shadow-xl animate-fadeIn
                                        ${isMe ? "right-0" : "left-0"}
                                    `}
                      >
                        {SUPPORTED_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReaction(msg.id, emoji);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors transform hover:scale-125 duration-200"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reactions Display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div
                      className={`flex flex-wrap gap-1 mt-0.5 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.reactions.map((reaction, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleReaction(msg.id, reaction.emoji)}
                          className={`
                                            bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-black/40
                                            rounded-full px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400 
                                            flex items-center gap-1 border border-slate-200 dark:border-white/5 
                                            transition-all
                                            ${
                                              reaction.userIds.includes(
                                                user?.id || ""
                                              )
                                                ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                                                : ""
                                            }
                                        `}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="font-semibold">
                            {reaction.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Me User Avatar */}
                {isMe && (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border-2 border-slate-100 dark:border-[#282e39] shrink-0"></div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Sticky Input Area */}
        <div className="absolute bottom-0 left-0 right-0 z-40">
          {/* Typing Indicator */}
          <div
            className={`
              absolute bottom-full left-0 right-0 px-8 pb-2 pointer-events-none transition-opacity duration-300
              ${typingUsers.length > 0 ? "opacity-100" : "opacity-0"}
          `}
          >
            <div className="flex items-center gap-2 max-w-[960px] mx-auto">
              <div className="flex gap-1 h-2 items-center">
                <span
                  className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
              <span className="text-xs font-semibold text-primary/80 drop-shadow-sm">
                {getTypingText()}
              </span>
            </div>
          </div>

          {/* Gradient Fade */}
          <div className="h-12 w-full bg-gradient-to-t from-white dark:from-background-dark to-transparent pointer-events-none"></div>

          {/* Input Bar */}
          <div className="bg-white dark:bg-background-dark px-4 md:px-8 pb-6 pt-2">
            <div className="max-w-[960px] mx-auto bg-slate-100 dark:bg-[#1a202c]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[20px] p-2 pr-3 flex items-end gap-2 shadow-lg shadow-black/5 dark:shadow-black/20 relative z-10">
              <button className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-white/10 transition-colors shrink-0">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <div className="flex-1 min-w-0 py-2.5">
                <textarea
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 resize-none max-h-32 text-base leading-relaxed"
                  placeholder="Type a message..."
                  rows={1}
                  style={{ minHeight: "24px" }}
                ></textarea>
              </div>
              <button className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-full text-slate-400 hover:text-yellow-500 hover:bg-white dark:hover:bg-white/10 transition-colors shrink-0">
                <span className="material-symbols-outlined">
                  sentiment_satisfied
                </span>
              </button>
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="h-10 w-10 md:h-11 md:w-11 bg-primary hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/25 transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined -ml-0.5 mt-0.5 text-[20px]">
                  send
                </span>
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-slate-400 dark:text-slate-600">
                Messages are anonymous and disappear after the pulse ends.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
