import {
  Key,
  MessagesSquare,
  Clock,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import type { Id, Doc } from "../../convex/_generated/dataModel";

const NAV_ITEMS = [
  { id: "chat", label: "Chat", icon: MessagesSquare, badge: "BETA" },
  { id: "keys", label: "API Keys", icon: Key },
];

interface MobileSidebarProps {
  isOpen: boolean;
  activeTab: string;
  activeSessionId: Id<"sessions"> | null;
  isRecentChatsOpen: boolean;
  openSessionMenuId: Id<"sessions"> | null;
  deletingSessionId: Id<"sessions"> | null;
  sessions: Doc<"sessions">[] | undefined;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
  onStartNewChat: () => void;
  onToggleRecentChats: () => void;
  onOpenSession: (sessionId: Id<"sessions">) => void;
  onToggleSessionMenu: (sessionId: Id<"sessions">) => void;
  onDeleteSession: (sessionId: Id<"sessions">) => void;
}

export default function MobileSidebar({
  isOpen,
  activeTab,
  activeSessionId,
  isRecentChatsOpen,
  openSessionMenuId,
  deletingSessionId,
  sessions,
  onClose,
  onSelectTab,
  onStartNewChat,
  onToggleRecentChats,
  onOpenSession,
  onToggleSessionMenu,
  onDeleteSession,
}: MobileSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 h-full w-[18rem] border-r transition-transform duration-200 ease-out flex flex-col bg-white dark:bg-[#262624] text-zinc-800 dark:text-zinc-200 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex h-[60px] w-full shrink-0 border-b dark:border-zinc-800 p-3 items-center">
            <div className="flex items-center gap-3 w-full pl-2">
              <div className="size-8 shrink-0 flex items-center justify-center">
                <img
                  src="/Atum Logo.png"
                  alt="Atum Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex w-full items-center opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
                <p className="text-base font-semibold tracking-wide">Atum AI</p>
              </div>
            </div>
          </div>

          <div className="flex grow flex-col gap-4 w-full h-full p-2">
            <div className="flex flex-col gap-1 w-full overflow-visible">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition whitespace-nowrap ${
                      isActive && !activeSessionId
                        ? "bg-[#1E1E1E] text-white"
                        : "text-zinc-400 hover:bg-[#1E1E1E]/50 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <div className="ml-2 flex flex-1 items-center gap-2 opacity-100 transition-opacity">
                      <p className="text-sm font-medium">{item.label}</p>
                      {item.badge && (
                        <span className="ml-auto text-zinc-500 text-xs font-normal">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  onStartNewChat();
                  onClose();
                }}
                className="mt-2 flex h-9 w-full items-center rounded-md px-2.5 py-2 bg-[#BFA06A] text-[#1E1E1E] hover:bg-[#D0B27C] transition"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="ml-2 text-sm font-medium">New Chat</span>
              </button>

              <div className="mt-4 pt-4 border-t border-zinc-800/50">
                <button
                  onClick={onToggleRecentChats}
                  className="flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition whitespace-nowrap text-zinc-400 hover:bg-[#1E1E1E]/50 hover:text-zinc-200"
                >
                  <Clock className="h-4 w-4 shrink-0" />
                  <div className="ml-2 flex flex-1 items-center gap-2 opacity-100 transition-opacity">
                    <p className="text-sm font-medium">Recent Chats</p>
                    {isRecentChatsOpen ? (
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </div>
                </button>

                {isRecentChatsOpen && sessions !== undefined && (
                  <div className="mt-1 flex flex-col gap-0.5 ml-4">
                    {sessions.map((session: Doc<"sessions">) => (
                      <div key={session._id} className="relative">
                        <button
                          onClick={() => {
                            onOpenSession(session._id);
                            onClose();
                          }}
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
                            onToggleSessionMenu(session._id);
                          }}
                          className="absolute right-1 top-1/2 z-20 -translate-y-1/2 p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/40"
                          title="Session options"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {openSessionMenuId === session._id && (
                          <div
                            className="absolute right-0 top-8 z-30 min-w-[130px] rounded-md border border-zinc-700 bg-[#1A1A19] p-1 shadow-lg"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                onDeleteSession(session._id);
                                onClose();
                              }}
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
    </>
  );
}
