"use client";

import { useState } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentHeader from "@/components/student/StudentHeader";
import { ReactNode } from "react";

interface StudentLayoutContentProps {
  children: ReactNode;
}

const StudentLayoutContent = ({ children }: StudentLayoutContentProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Middleware handles auth protection - no client-side checks needed
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <StudentSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <StudentHeader 
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

export default StudentLayoutContent;
