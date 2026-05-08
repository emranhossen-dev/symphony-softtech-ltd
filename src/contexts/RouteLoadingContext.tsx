"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RouteLoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean, message?: string) => void;
  loadingMessage: string;
}

const RouteLoadingContext = createContext<RouteLoadingContextType | undefined>(undefined);

export function RouteLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const setLoading = (loading: boolean, message?: string) => {
    setIsLoading(loading);
    if (message) {
      setLoadingMessage(message);
    }
  };

  return (
    <RouteLoadingContext.Provider value={{ isLoading, setLoading, loadingMessage }}>
      {children}
    </RouteLoadingContext.Provider>
  );
}

export function useRouteLoading() {
  const context = useContext(RouteLoadingContext);
  if (context === undefined) {
    throw new Error('useRouteLoading must be used within a RouteLoadingProvider');
  }
  return context;
}
