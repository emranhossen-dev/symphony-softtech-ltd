"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface SimpleSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SimpleSelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface SimpleSelectContentProps {
  children: React.ReactNode;
  open?: boolean;
  className?: string;
}

interface SimpleSelectItemProps {
  value: string;
  children: React.ReactNode;
  onClick?: (value: string) => void;
  className?: string;
}

const SimpleSelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {}
});

const SimpleSelect: React.FC<SimpleSelectProps> = ({ value, onValueChange, children, className }) => {
  const [open, setOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SimpleSelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div ref={selectRef} className={`relative ${className}`} style={{ zIndex: open ? 9999 : 'auto', overflow: 'visible' }}>
        {children}
      </div>
    </SimpleSelectContext.Provider>
  );
};

const SimpleSelectTrigger: React.FC<SimpleSelectTriggerProps> = ({ children, className }) => {
  const { open, setOpen } = React.useContext(SimpleSelectContext);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${className}`}
      onClick={handleClick}
    >
      {children}
      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
    </button>
  );
};

const SimpleSelectContent: React.FC<SimpleSelectContentProps> = ({ children, className }) => {
  const { open } = React.useContext(SimpleSelectContext);
  
  return (
    <div 
      className={`absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg transition-all duration-200 ${
        open ? 'opacity-100 visible' : 'opacity-0 invisible'
      } ${className}`}
      style={{ 
        zIndex: 9999,
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {children}
    </div>
  );
};

const SimpleSelectItem: React.FC<SimpleSelectItemProps> = ({ value, children, onClick, className }) => {
  const { onValueChange, setOpen } = React.useContext(SimpleSelectContext);

  const handleClick = () => {
    onValueChange?.(value);
    setOpen(false);
    onClick?.(value);
  };

  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-2 text-sm text-gray-800 outline-none hover:bg-green-50 focus:bg-green-50 transition-colors duration-150 ${className}`}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};

export { SimpleSelect, SimpleSelectTrigger, SimpleSelectContent, SimpleSelectItem };
