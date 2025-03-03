import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isLargeOpen, setIsLargeOpen] = useState(true); // Default open on large screens
  const [isSmallOpen, setIsSmallOpen] = useState(false); // Default closed on small screens

  const toggle = () => {
    if (window.innerWidth >= 1024) {
      setIsLargeOpen((prev) => !prev); // Toggle on desktop
    } else {
      setIsSmallOpen((prev) => !prev); // Toggle overlay on mobile
    }
  };

  const close = () => {
    setIsSmallOpen(false); // Close overlay on mobile
  };

  const value = {
    isLargeOpen,
    isSmallOpen,
    toggle,
    close,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebarContext must be used within SidebarProvider');
  return context;
}

/*Notes:
isLargeOpen controls the sidebar’s visibility on large screens (desktop, ≥1024px).
isSmallOpen controls the sidebar overlay on small screens (mobile, <1024px).
toggle and close functions manage sidebar state based on screen size.
This replaces the local isSidebarCollapsed state in Layout.js.

*/