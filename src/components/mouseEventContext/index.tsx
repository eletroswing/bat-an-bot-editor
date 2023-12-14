import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ClickContextProps {
  addClickListener: (listener: (event: MouseEvent) => void) => void;
  removeClickListener: (listener: (event: MouseEvent) => void) => void;
}

const ClickContext = createContext<ClickContextProps | undefined>(undefined);

export const ClickProvider: any = ({ children }: any) => {
  const [clickListeners, setClickListeners] = useState<((event: MouseEvent) => void)[]>([]);

  const addClickListener = useCallback((listener: (event: MouseEvent) => void) => {
    setClickListeners((prevListeners) => [...prevListeners, listener]);
  }, []);

  const removeClickListener = useCallback((listener: (event: MouseEvent) => void) => {
    setClickListeners((prevListeners) => prevListeners.filter((l) => l !== listener));
  }, []);

  const handleGlobalClick = useCallback((event: MouseEvent) => {
    clickListeners.forEach((listener) => listener(event));
  }, [clickListeners]);

  useEffect(() => {
    const divElement = document.getElementById('clickProviderDiv');
    if (divElement) {
      divElement.addEventListener('click', handleGlobalClick);
    }

    return () => {
      if (divElement) {
        divElement.removeEventListener('click', handleGlobalClick);
      }
    };
  }, [handleGlobalClick]);

  const contextValue = { addClickListener, removeClickListener };

  return (
    <ClickContext.Provider value={contextValue}>
      <div className="w-full h-full" id="clickProviderDiv">
        {children}
      </div>
    </ClickContext.Provider>
  );
};

export const useMouseClick = () => {
  const context = useContext(ClickContext);
  if (!context) {
    throw new Error('useMouseClick must be used inside ClickProvider');
  }
  return context;
};
