import { Key, Plus } from 'lucide-react';

export default function ApiKeys() {
  return (
    <div className="flex-1 p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text">API Access Keys</h2>
          <p className="text-text-muted mt-1">Manage external authentication tokens mapped to workspaces.</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
          <Plus size={18} />
          <span className="font-medium">Generate Key</span>
        </button>
      </header>
      
      <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8 border-border/40">
        <div className="w-20 h-20 bg-surface border border-border/60 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative">
          <Key className="text-primary w-10 h-10 relative z-10" />
        </div>
        <h3 className="text-xl font-medium text-text mb-2">No Active Keys</h3>
        <p className="text-text-muted max-w-md mx-auto mb-8 leading-relaxed">
          Generate an API key to securely allow your external SaaS applications to interface with the Atum AI.
        </p>
      </div>
    </div>
  );
}
