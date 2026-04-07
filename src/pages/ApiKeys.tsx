import { useState } from 'react';
import { Key, Plus, X, Copy, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ApiKeys() {
  const keys = useQuery(api.apiKeys.list);
  const createKey = useMutation(api.apiKeys.create);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setIsGenerating(true);
    await createKey({ name: newKeyName });
    setNewKeyName('');
    setIsGenerating(false);
    setIsModalOpen(false);
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 p-8 h-full flex flex-col overflow-y-auto custom-scrollbar relative">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text">API Access Keys</h2>
          <p className="text-text-muted mt-1">Manage external authentication tokens mapped to workspaces.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        >
          <Plus size={18} />
          <span className="font-medium">Generate Key</span>
        </button>
      </header>
      
      {keys === undefined ? (
        <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : keys === null || keys.length === 0 ? (
        <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8 border-border/40">
          <div className="w-20 h-20 bg-surface border border-border/60 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative">
            <Key className="text-primary w-10 h-10 relative z-10" />
          </div>
          <h3 className="text-xl font-medium text-text mb-2">No Active Keys</h3>
          <p className="text-text-muted max-w-md mx-auto leading-relaxed">
            Generate an API key to securely allow your external SaaS applications to interface with the Atum AI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full content-start">
          {keys.map((k) => (
            <div key={k._id} className="glass-panel p-5 rounded-2xl flex items-center justify-between border-border/60 hover:border-primary/50 transition-colors">
              <div>
                <h4 className="font-medium text-text mb-1">{k.name}</h4>
                <code className="text-sm text-primary/80 bg-primary/10 px-2 py-1 rounded-md">{k.keyHash.substring(0, 10)}...</code>
              </div>
              <button 
                onClick={() => copyToClipboard(k.keyHash)}
                className="p-2.5 hover:bg-surface rounded-xl transition-colors text-text-muted hover:text-white"
              >
                {copiedKey === k.keyHash ? <CheckCircle2 className="text-green-400" size={20} /> : <Copy size={20} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl border-border/80">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-text">Create New API Key</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text transition-colors p-1">
                <X size={20} />
              </button>
            </div>
            <div className="mb-8">
              <label className="block text-sm font-medium text-text-muted mb-2">Key Name (e.g., Support Team Dashboard)</label>
              <input 
                type="text" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter a descriptive name"
                className="w-full bg-surface border border-border/80 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary/60 transition-colors"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-text-muted hover:text-white hover:bg-surface transition-colors font-medium border border-transparent shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newKeyName.trim() || isGenerating}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-white rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:shadow-none font-medium border border-transparent flex items-center gap-2"
              >
                {isGenerating && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
