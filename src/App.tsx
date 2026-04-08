import { useEffect, useState } from "react";
import {
  Key,
  MessagesSquare,
  PanelLeft,
  Clock,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import Chat from "./pages/Chat";
import Usage from "./pages/Usage";
import Logs from "./pages/Logs";
import ApiKeys from "./pages/ApiKeys";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id, Doc } from "../convex/_generated/dataModel";

const NAV_ITEMS = [
  { id: "chat", label: "Chat", icon: MessagesSquare, badge: "BETA" },
  { id: "keys", label: "API Keys", icon: Key },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<Id<"sessions"> | null>(
    null,
  );
  const [isRecentChatsOpen, setIsRecentChatsOpen] = useState(false);
  const [openSessionMenuId, setOpenSessionMenuId] =
    useState<Id<"sessions"> | null>(null);
  const [deletingSessionId, setDeletingSessionId] =
    useState<Id<"sessions"> | null>(null);

  const sessions = useQuery(api.sessions.list) as Doc<"sessions">[] | undefined;
  const removeSession = useMutation(api.sessions.remove);

  useEffect(() => {
    if (!openSessionMenuId) return;

    const handleOutsideClick = () => setOpenSessionMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [openSessionMenuId]);

  const handleStartNewChat = () => {
    setActiveTab("chat");
    setActiveSessionId(null);
    setOpenSessionMenuId(null);
  };

  const handleOpenSession = (sessionId: Id<"sessions">) => {
    setActiveTab("chat");
    setActiveSessionId(sessionId);
    setOpenSessionMenuId(null);
  };

  const handleDeleteSession = async (sessionId: Id<"sessions">) => {
    if (deletingSessionId) return;

    setDeletingSessionId(sessionId);
    try {
      await removeSession({ id: sessionId });
      if (activeSessionId === sessionId) {
        handleStartNewChat();
      }
    } finally {
      setDeletingSessionId(null);
      setOpenSessionMenuId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-black">
      <div
        className={`fixed left-0 z-40 h-full shrink-0 border-r transition-all duration-200 ease-out flex flex-col bg-white dark:bg-[#262624] text-zinc-800 dark:text-zinc-200 ${isCollapsed ? "w-14" : "w-60"}`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="flex h-[60px] w-full shrink-0 border-b dark:border-zinc-800 p-3 items-center">
            <div
              className={`flex items-center gap-3 w-full pl-2 ${isCollapsed ? "justify-center pl-0" : ""}`}
            >
              <div className="size-8 shrink-0 flex items-center justify-center">
                <img
                  src="/Atum Logo.png"
                  alt="Atum Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="flex w-full items-center opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
                  <p className="text-base font-semibold tracking-wide">
                    Atum AI
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="flex grow flex-col gap-4 w-full h-full p-2">
            <div className="flex flex-col gap-1 w-full overflow-hidden">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === "chat") {
                        setActiveSessionId(null);
                      }
                    }}
                    className={`flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition whitespace-nowrap ${
                      isActive && !activeSessionId
                        ? "bg-[#1E1E1E] text-white"
                        : "text-zinc-400 hover:bg-[#1E1E1E]/50 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && (
                      <div className="ml-2 flex flex-1 items-center gap-2 opacity-100 transition-opacity">
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.badge && (
                          <span className="ml-auto text-zinc-500 text-xs font-normal">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}

              {!isCollapsed && (
                <button
                  onClick={handleStartNewChat}
                  className="mt-2 flex h-9 w-full items-center rounded-md px-2.5 py-2 bg-[#BFA06A] text-[#1E1E1E] hover:bg-[#D0B27C] transition"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span className="ml-2 text-sm font-medium">New Chat</span>
                </button>
              )}

              {/* Recent Chats Dropdown */}
              <div className="mt-4 pt-4 border-t border-zinc-800/50">
                <button
                  onClick={() => setIsRecentChatsOpen(!isRecentChatsOpen)}
                  className={`flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition whitespace-nowrap text-zinc-400 hover:bg-[#1E1E1E]/50 hover:text-zinc-200`}
                >
                  <Clock className="h-4 w-4 shrink-0" />
                  {!isCollapsed && (
                    <div className="ml-2 flex flex-1 items-center gap-2 opacity-100 transition-opacity">
                      <p className="text-sm font-medium">Recent Chats</p>
                      {isRecentChatsOpen ? (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </div>
                  )}
                </button>

                {!isCollapsed &&
                  isRecentChatsOpen &&
                  sessions !== undefined && (
                    <div className="mt-1 flex flex-col gap-0.5 ml-4">
                      {sessions.map((session: Doc<"sessions">) => (
                        <div key={session._id} className="relative">
                          <button
                            onClick={() => handleOpenSession(session._id)}
                            className={`flex items-center gap-2 h-8 w-full rounded-md pl-2 pr-8 py-1 text-sm transition whitespace-nowrap overflow-hidden ${
                              activeTab === "chat" &&
                              activeSessionId === session._id
                                ? "text-zinc-200 bg-[#2A2A2A]"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1E1E1E]/50"
                            }`}
                          >
                            <MessageCircle className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            <span className="truncate">{session.name}</span>
                          </button>

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenSessionMenuId((prev) =>
                                prev === session._id ? null : session._id,
                              );
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/40"
                            title="Session options"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>

                          {openSessionMenuId === session._id && (
                            <div
                              className="absolute right-0 top-8 z-50 min-w-[130px] rounded-md border border-zinc-700 bg-[#1A1A19] p-1 shadow-lg"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button
                                onClick={() => handleDeleteSession(session._id)}
                                disabled={deletingSessionId === session._id}
                                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {deletingSessionId === session._id
                                  ? "Deleting..."
                                  : "Delete chat"}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {sessions.length === 0 && (
                        <p className="text-xs text-zinc-600 px-2 py-1">
                          No recent chats
                        </p>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main
        className={`flex-1 flex flex-col relative transition-all duration-200 ease-out bg-[#262624] ${isCollapsed ? "ml-14" : "ml-60"}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 left-4 z-50 p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-[#30302E] transition-colors"
          title="Toggle Sidebar"
        >
          <PanelLeft size={20} />
        </button>

        <div className="relative h-full flex flex-col z-0 w-full overflow-hidden">
          {activeTab === "chat" && (
            <Chat
              sessionId={activeSessionId}
              onNewSession={(id) => setActiveSessionId(id)}
            />
          )}
          {activeTab === "usage" && <Usage />}
          {activeTab === "logs" && <Logs />}
          {activeTab === "keys" && <ApiKeys />}
        </div>
      </main>
    </div>
  );
}
