"use client";

import { Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggler = () => {
  const { theme } = useTheme();

  return (
    <div className="glass-button p-3 rounded-xl flex items-center justify-center">
      <Moon className="w-5 h-5 text-blue-400" />
    </div>
  );
};

export default ThemeToggler;
