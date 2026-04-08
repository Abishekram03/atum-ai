import { useState } from 'react';
import { Plus, X, Copy, CheckCircle2, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ApiKeys() {
  const keys = useQuery(api.apiKeys.list);
  const createKey = useMutation(api.apiKeys.create);
  const deleteKey = useMutation(api.apiKeys.remove);
  
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
    <div className="flex-1 p-8 h-full flex flex-col overflow-y-auto custom-scrollbar bg-transparent">
       <div className="max-w-4xl mx-auto w-full pt-4">
        {/* Header Block matching Anthropic style  */}
        <header className="mb-8 flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-semibold text-zinc-100 tracking-tight">API keys</h2>
              <span className="bg-[#2A2A2A] text-zinc-400 text-sm px-2.5 py-[1px] rounded-full font-medium">{keys?.length || 0}</span>
            </div>
            <p className="text-zinc-400 mt-4 text-[15px] font-medium">API keys are owned by workspaces and remain active even after the creator is removed</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 mt-1 rounded-lg transition-colors font-medium text-[15px] shadow-sm"
          >
            <Plus size={18} />
            <span>Create key</span>
          </button>
        </header>

        {/* Table Block */}
        <div className="bg-[#1C1C1E] border border-zinc-800 rounded-xl overflow-hidden mt-6">
          <div className="grid grid-cols-[1fr,auto] gap-4 px-6 py-4 border-b border-zinc-800 text-sm font-medium text-zinc-400">
             <div>Key</div>
          </div>
          
          <div className="flex flex-col">
             {keys === undefined ? (
               <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-400"></div>
               </div>
             ) : keys === null || keys.length === 0 ? (
               <div className="p-12 flex flex-col items-center justify-center text-center">
                  <h3 className="text-zinc-300 font-medium mb-1">No API keys found</h3>
                  <p className="text-zinc-500 text-sm">Create an API key to programmatically access Atum AI.</p>
               </div>
             ) : (
               keys.map((k) => (
                 <div key={k._id} className="grid grid-cols-[1fr,auto] gap-4 px-6 py-4 items-center border-b border-zinc-800/50 last:border-0 hover:bg-[#2A2A2A]/20 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-200 font-medium text-[15px]">{k.name}</span>
                      <span className="text-zinc-500 font-mono text-[13px] tracking-tight">{k.keyHash.substring(0, 20)}...</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <button onClick={() => copyToClipboard(k.keyHash)} className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-md hover:bg-zinc-800" title="Copy Key">
                         {copiedKey === k.keyHash ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                       </button>
                       <button onClick={() => deleteKey({ id: k._id })} className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded-md hover:bg-zinc-800" title="Delete Key">
                         <Trash2 size={18} />
                       </button>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
       </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C1C1E] w-full max-w-md p-6 rounded-2xl shadow-2xl border border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-zinc-100">Create new secret key</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 transition-colors p-1">
                <X size={20} />
              </button>
            </div>
            <div className="mb-8">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
              <input 
                type="text" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="My API Key"
                className="w-full bg-[#2A2A2A] border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#2A2A2A] transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newKeyName.trim() || isGenerating}
                className="px-4 py-2 bg-zinc-100 hover:bg-white disabled:opacity-50 disabled:hover:bg-zinc-100 text-zinc-900 rounded-lg transition-all font-medium text-sm flex items-center gap-2"
              >
                {isGenerating && <div className="w-4 h-4 rounded-full border-2 border-zinc-900/30 border-t-zinc-900 animate-spin" />}
                Create secret key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
