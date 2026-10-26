import React, { useState } from 'react';
import { Terminal, Download, Trash2, Filter } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  source: string;
  message: string;
}

export const DiagnosticLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    { id: '1', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), level: 'info', source: 'Anything Daemon', message: 'Ecosystem runtime initialized smoothly.' },
    { id: '2', timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(), level: 'info', source: 'GitHub Engine', message: 'Checked updates for MediaFlow Studio: v26.10.26 is up to date.' },
    { id: '3', timestamp: new Date(Date.now() - 900000).toLocaleTimeString(), level: 'warn', source: 'Launcher', message: 'Path verification completed. All child apps present.' },
  ]);

  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  const filteredLogs = logs.filter(l => filterLevel === 'all' || l.level === filterLevel);

  const clearLogs = () => setLogs([]);

  return (
    <GlassCard className="p-6 border-zinc-200 dark:border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-500" />
          <h4 className="text-base font-bold">Diagnostic Logs & Telemetry</h4>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs outline-none"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warnings</option>
            <option value="error">Errors</option>
          </select>
          <button
            onClick={clearLogs}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="font-mono text-xs bg-black/60 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2 border border-white/5">
        {filteredLogs.length > 0 ? (
          filteredLogs.map(l => (
            <div key={l.id} className="flex items-start gap-3">
              <span className="text-zinc-500 shrink-0">{l.timestamp}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${
                l.level === 'error' ? 'bg-red-500/20 text-red-400' :
                l.level === 'warn' ? 'bg-amber-500/20 text-amber-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {l.level}
              </span>
              <span className="text-zinc-400 shrink-0">[{l.source}]</span>
              <span className="text-zinc-200">{l.message}</span>
            </div>
          ))
        ) : (
          <div className="text-zinc-500 text-center py-4">No diagnostic logs recorded.</div>
        )}
      </div>
    </GlassCard>
  );
};
