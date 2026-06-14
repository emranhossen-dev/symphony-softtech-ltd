"use client";

import { useState } from "react";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import MentorHeader from "@/components/mentor/MentorHeader";
import { ReactNode } from "react";

interface MentorLayoutProps {
  children: ReactNode;
}

const MentorLayout = ({ children }: MentorLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock mentor protection - in real app, this would be proper auth
  const isMentor = true; // This would come from auth context

  if (!isMentor) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f4c 25%, #0d1b3e 50%, #1a1f4c 75%, #0a0e27 100%)', color: '#f1f5f9' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#1a1f4c] to-[#0d1b3e] flex text-white">
      {/* Sidebar */}
      <MentorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <MentorHeader
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MentorLayout;
