import { useEffect, useRef, useState } from "react";
import { PanelLeft } from "lucide-react";
import Chat from "./pages/Chat";
import ApiKeys from "./pages/ApiKeys";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id, Doc } from "../convex/_generated/dataModel";
import SignIn from "./components/Auth/SignIn";
import {
  clearAuthSession,
  getAuthSession,
  isAuthSessionExpired,
  saveAuthSession,
} from "./lib/auth";
import Sidebar from "./components/Sidebar";
import MobileSidebar from "./components/MobileSidebar";

export default function App() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
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

  const sessions = useQuery(
    api.sessions.list,
    isAuthenticated ? {} : "skip",
  ) as Doc<"sessions">[] | undefined;
  const removeSession = useMutation(api.sessions.remove);
  const shouldCollapseSidebar = !isMobile && isCollapsed;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsHydrated(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const session = getAuthSession();

    if (session && !isAuthSessionExpired(session)) {
      setIsAuthenticated(true);
    } else {
      clearAuthSession();
      setIsAuthenticated(false);
    }

    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (!openSessionMenuId) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpenSessionMenuId(null);
      }
    };

    window.addEventListener("pointerdown", handleOutsidePointerDown);
    return () =>
      window.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [openSessionMenuId]);

  const handleStartNewChat = () => {
    setActiveTab("chat");
    setActiveSessionId(null);
    setOpenSessionMenuId(null);
    setIsMobileSidebarOpen(false);
  };

  const handleOpenSession = (sessionId: Id<"sessions">) => {
    setActiveTab("chat");
    setActiveSessionId(sessionId);
    setOpenSessionMenuId(null);
    setIsMobileSidebarOpen(false);
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

  const handleSignIn = async (email: string, password: string) => {
    setIsSigningIn(true);
    setAuthError("");

    const adminEmail = import.meta.env.ADMIN_EMAIL.trim().toLowerCase();
    const adminPassword = import.meta.env.ADMIN_PASSWORD;

    if (!email.trim() || !password.trim()) {
      setAuthError("Please enter both email and password.");
      setIsSigningIn(false);
      return;
    }

    if (
      email.trim().toLowerCase() !== adminEmail ||
      password !== adminPassword
    ) {
      setAuthError("Invalid admin credentials.");
      setIsSigningIn(false);
      return;
    }

    saveAuthSession(email.trim());
    setIsAuthenticated(true);
    setActiveTab("chat");
    setActiveSessionId(null);
    setOpenSessionMenuId(null);
    setAuthError("");
    setIsSigningIn(false);
  };

  if (!isAuthReady || !isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#24231f] text-zinc-200">
        <div className="flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-500">
          <div className="mb-5 flex items-center gap-4">
            <img
              src="/Atum Logo.png"
              alt="Atum Logo"
              className="h-16 w-16 object-contain"
            />
            <h1 className="font-serif text-4xl font-light tracking-[0.22em] text-zinc-100 sm:text-5xl">
              Atum AI
            </h1>
          </div>
          <div className="mt-6">
            <div className="wave-loader" aria-label="Loading">
              <span className="wave-loader__bar" />
              <span className="wave-loader__bar" />
              <span className="wave-loader__bar" />
              <span className="wave-loader__bar" />
              <span className="wave-loader__bar" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <SignIn
        onSignIn={handleSignIn}
        error={authError}
        isSubmitting={isSigningIn}
      />
    );
  }

  if (!isHydrated || sessions === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#24231f] text-zinc-200">
        <div className="flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-500">
          <div className="mb-5 flex items-center gap-4">
            <img
              src="/Atum Logo.png"
              alt="Atum Logo"
              className="h-16 w-16 object-contain"
            />
            <h1 className="font-serif text-4xl font-light tracking-[0.22em] text-zinc-100 sm:text-5xl">
              Atum AI
            </h1>
          </div>
          <div className="mt-6">
            <div className="wave-loader" aria-label="Loading">
              <span className="wave-loader__bar" />
              <span className="wave-loader__bar" />
              <span className="wave-loader__bar" />
              <span className="wave-loader__bar" />
              <span className="wave-loader__bar" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#24231f]">
      {isMobile ? (
        <>
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            activeTab={activeTab}
            activeSessionId={activeSessionId}
            isRecentChatsOpen={isRecentChatsOpen}
            openSessionMenuId={openSessionMenuId}
            deletingSessionId={deletingSessionId}
            sessions={sessions}
            onClose={() => setIsMobileSidebarOpen(false)}
            onSelectTab={(tabId) => {
              setActiveTab(tabId);
              if (tabId === "chat") {
                setActiveSessionId(null);
              }
            }}
            onStartNewChat={handleStartNewChat}
            onToggleRecentChats={() => setIsRecentChatsOpen(!isRecentChatsOpen)}
            onOpenSession={handleOpenSession}
            onToggleSessionMenu={(sessionId) =>
              setOpenSessionMenuId((prev) =>
                prev === sessionId ? null : sessionId,
              )
            }
            onDeleteSession={handleDeleteSession}
          />
        </>
      ) : (
        <Sidebar
          sidebarRef={sidebarRef}
          isCollapsed={isCollapsed}
          activeTab={activeTab}
          activeSessionId={activeSessionId}
          isRecentChatsOpen={isRecentChatsOpen}
          openSessionMenuId={openSessionMenuId}
          deletingSessionId={deletingSessionId}
          sessions={sessions}
          onSelectTab={(tabId) => {
            setActiveTab(tabId);
            if (tabId === "chat") {
              setActiveSessionId(null);
            }
          }}
          onStartNewChat={handleStartNewChat}
          onToggleRecentChats={() => setIsRecentChatsOpen(!isRecentChatsOpen)}
          onOpenSession={handleOpenSession}
          onToggleSessionMenu={(sessionId) =>
            setOpenSessionMenuId((prev) =>
              prev === sessionId ? null : sessionId,
            )
          }
          onDeleteSession={handleDeleteSession}
        />
      )}

      <main
        className={`flex-1 flex flex-col relative transition-all duration-200 ease-out bg-[#262624] ${isMobile ? "ml-0" : shouldCollapseSidebar ? "ml-14" : "ml-60"}`}
      >
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-4 left-4 z-50 p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-[#30302E] transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft size={20} />
          </button>
        )}

        {isMobile && !isMobileSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#30302E] text-zinc-100 ring-1 ring-white/10 transition hover:bg-[#3A3936] md:hidden"
            aria-label="Open sidebar"
          >
            <PanelLeft size={20} />
          </button>
        )}

        <div className="relative h-full flex flex-col z-0 w-full overflow-hidden">
          {activeTab === "chat" && (
            <Chat
              sessionId={activeSessionId}
              onNewSession={(id) => {
                setActiveSessionId(id);
                setIsMobileSidebarOpen(false);
              }}
            />
          )}
          {activeTab === "keys" && <ApiKeys />}
        </div>
      </main>
    </div>
  );
}
