"use client";

import { useState } from "react";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import EmployeeHeader from "@/components/employee/EmployeeHeader";
import { ReactNode } from "react";

interface EmployeeLayoutProps {
  children: ReactNode;
}

const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock employee protection - in real app, this would be proper auth
  const isEmployee = true; // This would come from auth context

  if (!isEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-main-container min-h-screen bg-gray-50 h-screen overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <EmployeeSidebar 
          isOpen={true}
          onClose={() => {}}
          isMobile={false}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full ml-0 lg:ml-64 employee-layout-with-sidebar transition-all duration-300">
          {/* Header */}
          <EmployeeHeader 
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-0 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
