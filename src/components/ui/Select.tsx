"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// Custom Select component without native select element
const Select = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, children, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || '');

  React.useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    onValueChange?.(newValue);
  };

  return (
    <div className="relative" ref={ref} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childType = child.type as any;
          
          // Pass props to specific child components
          if (childType === SelectTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isOpen,
              setIsOpen,
              value: selectedValue,
              ...(child.props as any)
            });
          }
          
          if (childType === SelectContent) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isOpen,
              setIsOpen,
              ...(child.props as any)
            });
          }
          
          if (childType === SelectItem) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onValueChange: handleValueChange,
              ...(child.props as any)
            });
          }
          
          // For other children, pass through original props
          return child;
        }
        return child;
      })}
    </div>
  );
});
Select.displayName = "Select";

const SelectGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid w-full items-center gap-1.5", className)}
    {...props}
  />
));
SelectGroup.displayName = "SelectGroup";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string;
    value?: string;
  }
>(({ className, children, placeholder, value, ...props }, ref) => {
  const displayValue = children || value;
  
  return (
    <span
      ref={ref}
      className={cn("block truncate text-gray-900", className)}
      {...props}
    >
      {displayValue ? (
        displayValue
      ) : (
        <span className="text-gray-500">{placeholder || 'Select...'}</span>
      )}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    value?: string;
  }
>(({ className, children, isOpen, setIsOpen, value, ...props }, ref) => {
  const handleClick = () => {
    setIsOpen?.(!isOpen);
  };

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="flex-1 text-left">
        {children}
      </span>
      <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
  }
>(({ className, children, isOpen, setIsOpen, ...props }, ref) => {
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, children, value, onValueChange, ...props }, ref) => {
  const handleClick = () => {
    onValueChange?.(value || '');
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-gray-900 outline-none hover:bg-gray-100 hover:text-gray-900 focus:bg-blue-50 focus:text-blue-900",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
};
