import { BarChart3, TrendingUp, Zap, Clock } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Usage() {
  const metrics = useQuery(api.logs.getUsageMetrics);

  return (
    <div className="flex-1 p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold text-text">Usage Metrics</h2>
        <p className="text-text-muted mt-1">Track intelligence system loads and generation metrics.</p>
      </header>
      
      {metrics === undefined ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 border-b-2 border-primary rounded-full animate-[spin_1s_linear_infinite] mb-4" />
            <p className="text-text-muted font-medium">Loading telemetry...</p>
        </div>
      ) : metrics === null ? (
        <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8 border-border/40">
          <div className="w-20 h-20 bg-surface border border-border/60 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative">
            <BarChart3 className="text-primary w-10 h-10 relative z-10" />
          </div>
          <h3 className="text-xl font-medium text-text mb-2">No Telemetry Synced</h3>
          <p className="text-text-muted max-w-md mx-auto leading-relaxed">
            The analytics engine is waiting for interactions. Send a prompt to Atum to initialize live data metrics.
          </p>
        </div>
      ) : (
        <>
          {/* Real KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel p-6 rounded-2xl border-border/40 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Zap className="text-blue-400 w-6 h-6" />
                </div>
                {metrics.inferences > 0 && <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Live</span>}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-text mb-1">{metrics.inferences.toLocaleString()}</h3>
                <p className="text-text-muted text-sm font-medium">Total Inferences</p>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border-border/40 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <TrendingUp className="text-purple-400 w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-text mb-1">{metrics.totalLogs.toLocaleString()}</h3>
                <p className="text-text-muted text-sm font-medium">System Events Sent</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-border/40 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Clock className="text-amber-400 w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-text mb-1">{metrics.avgLatencyMs}ms</h3>
                <p className="text-text-muted text-sm font-medium">Avg Edge Latency</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 glass-panel rounded-2xl p-8 border-border/40 flex flex-col justify-center items-center text-center">
             <div className="p-4 bg-primary/10 rounded-2xl mb-4">
                <TrendingUp className="text-primary w-8 h-8" />
             </div>
             <h3 className="text-xl font-medium text-text mb-2">Metrics Active</h3>
             <p className="text-text-muted">Data points are actively streaming via the database pipeline.</p>
          </div>
        </>
      )}
    </div>
  );
}
