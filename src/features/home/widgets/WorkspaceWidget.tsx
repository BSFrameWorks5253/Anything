import React from 'react';
import { Layers } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const WorkspaceWidget: React.FC = () => {
  const { activeWorkspace, workspaces } = useWorkspace();

  return (
    <GlassCard className="p-5 border-zinc-200 dark:border-white/10 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-blue-500" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active Workspace</h4>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{activeWorkspace.name}</div>
        <div className="flex -space-x-2">
            {workspaces.map((ws, i) => (
                <div key={ws.id} className={`w-6 h-6 rounded-full border-2 ${activeWorkspace.id === ws.id ? 'border-blue-500 bg-blue-500' : 'border-zinc-800 bg-zinc-700'}`} />
            ))}
        </div>
      </div>
    </GlassCard>
  );
};
