import React, { createContext, useContext, useState, ReactNode } from 'react';

type CanvasContentType = 'chart' | 'form' | 'pdf' | null;

interface CanvasContextType {
  isOpen: boolean;
  contentType: CanvasContentType;
  data: any;
  openCanvas: (type: CanvasContentType, data?: any) => void;
  closeCanvas: () => void;
  toggleCanvas: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contentType, setContentType] = useState<CanvasContentType>(null);
  const [data, setData] = useState<any>(null);

  const openCanvas = (type: CanvasContentType, newData?: any) => {
    setContentType(type);
    setData(newData || null);
    setIsOpen(true);
  };

  const closeCanvas = () => {
    setIsOpen(false);
  };

  const toggleCanvas = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <CanvasContext.Provider
      value={{
        isOpen,
        contentType,
        data,
        openCanvas,
        closeCanvas,
        toggleCanvas,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}
