"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouteLoading } from "@/contexts/RouteLoadingContext";

export function useRouteChangeLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setLoading } = useRouteLoading();
  const previousPath = useRef(pathname);
  const previousParams = useRef(searchParams.toString());

  useEffect(() => {
    // Check if route has changed
    const currentPath = pathname;
    const currentParams = searchParams.toString();
    
    if (previousPath.current !== currentPath || previousParams.current !== currentParams) {
      // Show loading for route change
      setLoading(true, "Loading page...");
      
      // Hide loading after a short delay (simulating page load)
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      
      // Update previous values
      previousPath.current = currentPath;
      previousParams.current = currentParams;
      
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, setLoading]);
}
