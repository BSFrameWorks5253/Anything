import React, { createContext, useContext, useState, useEffect } from 'react';

export type ViewMode = 'creator' | 'user';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('creative_hub_view_mode');
    return (saved === 'user' || saved === 'creator') ? saved : 'user';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('creative_hub_view_mode', mode);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'creator' ? 'user' : 'creator');
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
