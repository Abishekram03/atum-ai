import ChatContainer from '../components/Chat/ChatContainer';

export default function Chat() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background/50">
      <header className="px-8 py-5 border-b border-border/50 flex items-center justify-between glass-panel rounded-none border-t-0 border-l-0 border-r-0">
        <div>
          <h2 className="text-lg font-semibold text-text">Chat Interface</h2>
          <p className="text-sm text-text-muted">Interact with the Atum intelligence layer</p>
        </div>
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>System Online</span>
          </span>
        </div>
      </header>
      <div className="flex-1 overflow-hidden p-6 relative">
        <ChatContainer />
      </div>
    </div>
  );
}
