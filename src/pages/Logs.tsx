import { Activity, AlertTriangle, CheckCircle, TerminalSquare } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Logs() {
  const metrics = useQuery(api.logs.getUsageMetrics);

  return (
    <div className="flex-1 p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold text-text">System Logs</h2>
        <p className="text-text-muted mt-1">Real-time error tracing and operational logging.</p>
      </header>
      
      {metrics === undefined ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 border-b-2 border-primary rounded-full animate-[spin_1s_linear_infinite] mb-4" />
            <p className="text-text-muted font-medium">Parsing system logs...</p>
        </div>
      ) : metrics === null ? (
        <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8 border-border/40">
          <div className="w-20 h-20 bg-surface border border-border/60 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden">
            <Activity className="text-primary w-10 h-10 relative z-10" />
          </div>
          <h3 className="text-xl font-medium text-text mb-2">No Logs Present</h3>
          <p className="text-text-muted max-w-md mx-auto leading-relaxed">
            The infrastructure has not recorded any errors, warnings, or info packets. All clear!
          </p>
        </div>
      ) : (
        <>
          {/* Real KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel p-6 rounded-2xl border-border/40">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/10">
                  <CheckCircle className="text-green-400 w-7 h-7" />
                </div>
                <div>
                  <p className="text-text-muted text-sm font-medium mb-0.5">Success Rate</p>
                  <h3 className="text-2xl font-bold text-text">
                    {metrics.totalLogs > 0 ? (((metrics.totalLogs - metrics.errors) / metrics.totalLogs) * 100).toFixed(1) : 100}%
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border-border/40">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-2xl border ${metrics.errors > 0 ? "bg-red-500/10 border-red-500/20" : "bg-surface border-border/60"}`}>
                  <AlertTriangle className={`${metrics.errors > 0 ? "text-red-400" : "text-text-muted/50"} w-7 h-7`} />
                </div>
                <div>
                  <p className="text-text-muted text-sm font-medium mb-0.5">Total Errors</p>
                  <h3 className="text-2xl font-bold text-text">{metrics.errors}</h3>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-border/40">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                  <TerminalSquare className="text-blue-400 w-7 h-7" />
                </div>
                <div>
                  <p className="text-text-muted text-sm font-medium mb-0.5">Events Captured</p>
                  <h3 className="text-2xl font-bold text-text">{metrics.totalLogs.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8 border-border/40">
            <div className="w-20 h-20 bg-surface border border-border/60 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden">
               <div className="absolute -inset-4 border border-primary/20 rounded-full animate-[spin_4s_linear_infinite]" />
              <Activity className="text-primary w-10 h-10 relative z-10" />
            </div>
            <h3 className="text-xl font-medium text-text mb-2">Systems Operational</h3>
            <p className="text-text-muted max-w-md mx-auto leading-relaxed">
              Diagnostic data is verified and routing actively. Advanced log searching features will be integrated over the next development phase.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
