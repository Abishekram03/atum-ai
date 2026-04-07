import { BarChart3 } from 'lucide-react';

export default function Usage() {
  return (
    <div className="flex-1 p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold text-text">Usage Metrics</h2>
        <p className="text-text-muted mt-1">Track intelligence system loads and generation metrics.</p>
      </header>
      
      <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8 border-border/40">
        <div className="w-20 h-20 bg-surface border border-border/60 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative">
          <div className="absolute inset-0 bg-primary/5 rounded-3xl animate-pulse" />
          <BarChart3 className="text-primary w-10 h-10 relative z-10" />
        </div>
        <h3 className="text-xl font-medium text-text mb-2">Awaiting Telemetry Data</h3>
        <p className="text-text-muted max-w-md mx-auto mb-8 leading-relaxed">
          The analytics engine is online, but we require more generative requests to compile meaningful insights. Activity will appear here shortly.
        </p>
        <button className="px-6 py-2.5 bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary/20 border border-primary/20 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          Refresh Metrics
        </button>
      </div>
    </div>
  );
}
