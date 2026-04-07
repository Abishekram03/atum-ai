import { useState } from 'react';
import { MessageSquare, BarChart2, Activity, Key } from 'lucide-react';
import Chat from './pages/Chat';
import Usage from './pages/Usage';
import Logs from './pages/Logs';
import ApiKeys from './pages/ApiKeys';

const NAV_ITEMS = [
  { id: 'chat', label: 'Chat Engine', icon: MessageSquare },
  { id: 'usage', label: 'Usage Metrics', icon: BarChart2 },
  { id: 'logs', label: 'System Logs', icon: Activity },
  { id: 'keys', label: 'API Keys', icon: Key },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border bg-surface/40 backdrop-blur flex flex-col z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Atum AI</h1>
          <p className="text-xs text-text-muted mt-1">Internal Intelligence Layer</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                    : 'text-text-muted hover:bg-surface hover:text-text border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary' : ''} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative h-full flex flex-col z-0">
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'usage' && <Usage />}
          {activeTab === 'logs' && <Logs />}
          {activeTab === 'keys' && <ApiKeys />}
        </div>
      </main>
    </div>
  );
}
