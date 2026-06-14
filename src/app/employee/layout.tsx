"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface EmployeeLayoutProps {
  children: ReactNode;
}

// Employees now use the admin panel directly (/admin/dashboard)
// This layout just redirects for backward compatibility
const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  // Render children briefly to avoid flash, but redirect immediately
  return <>{children}</>;
};

export default EmployeeLayout;
