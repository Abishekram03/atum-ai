import { Activity } from 'lucide-react';

export default function Logs() {
  return (
    <div className="flex-1 p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold text-text">System Logs</h2>
        <p className="text-text-muted mt-1">Real-time error tracing and operational logging.</p>
      </header>
      
      <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8 border-border/40">
        <div className="w-20 h-20 bg-surface border border-border/60 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden">
           <div className="absolute -inset-4 border border-primary/20 rounded-full animate-[spin_4s_linear_infinite]" />
          <Activity className="text-primary w-10 h-10 relative z-10" />
        </div>
        <h3 className="text-xl font-medium text-text mb-2">All Systems Operational</h3>
        <p className="text-text-muted max-w-md mx-auto mb-8 leading-relaxed">
          No critical errors or operational warnings have been intercepted by the edge workers. System health is optimal.
        </p>
      </div>
    </div>
  );
}
