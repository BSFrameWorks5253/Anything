import React, { createContext, useContext, useState } from 'react';

export type WorkspaceId = 'default' | 'creative' | 'media' | 'dev' | 'personal';

interface Workspace {
  id: WorkspaceId;
  name: string;
  apps: string[]; // App IDs
}

const WORKSPACES: Workspace[] = [
  { id: 'default', name: 'Everything', apps: [] },
  { id: 'creative', name: 'Creative Suite', apps: ['mediaflow-studio'] },
  { id: 'media', name: 'Media Production', apps: ['one-tap'] },
  { id: 'dev', name: 'Development', apps: [] },
  { id: 'personal', name: 'Personal', apps: [] },
];

interface WorkspaceContextType {
  activeWorkspace: Workspace;
  setActiveWorkspace: (id: WorkspaceId) => void;
  workspaces: Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<WorkspaceId>('default');

  const activeWorkspace = WORKSPACES.find(w => w.id === activeWorkspaceId) || WORKSPACES[0];

  return (
    <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace: setActiveWorkspaceId, workspaces: WORKSPACES }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return ctx;
};
