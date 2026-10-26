import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DataBusEvent {
  id: string;
  sender: string;
  topic: string;
  payload: any;
  timestamp: number;
}

interface DataBusContextType {
  events: DataBusEvent[];
  broadcastEvent: (topic: string, payload: any) => void;
}

const DataBusContext = createContext<DataBusContextType | undefined>(undefined);

export const DataBusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<DataBusEvent[]>([]);

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onDataBusEvent) {
      const unsub = electronAPI.onDataBusEvent((event: DataBusEvent) => {
        setEvents(prev => [event, ...prev].slice(0, 50));
      });
      return unsub;
    }
  }, []);

  const broadcastEvent = (topic: string, payload: any) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.broadcastDataBusEvent) {
      electronAPI.broadcastDataBusEvent({ topic, payload });
    } else {
      const localEvent: DataBusEvent = {
        id: `evt-${Date.now()}`,
        sender: 'Anything UI',
        topic,
        payload,
        timestamp: Date.now(),
      };
      setEvents(prev => [localEvent, ...prev].slice(0, 50));
    }
  };

  return (
    <DataBusContext.Provider value={{ events, broadcastEvent }}>
      {children}
    </DataBusContext.Provider>
  );
};

export const useDataBus = () => {
  const ctx = useContext(DataBusContext);
  if (!ctx) throw new Error('useDataBus must be used within a DataBusProvider');
  return ctx;
};
