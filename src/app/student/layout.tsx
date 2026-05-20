"use client";

import { useState, ReactNode } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentHeader from "@/components/student/StudentHeader";

interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

export default StudentLayout;
