import React, { useState, forwardRef } from 'react';
import { AlertCircle, FileText } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  placeholder?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className = '', 
    label, 
    error, 
    helperText, 
    showCharCount = false,
    maxLength,
    autoResize = false,
    value = '',
    onChange,
    ...props 
  }, ref) => {
    const [focused, setFocused] = useState(false);
    const currentLength = typeof value === 'string' ? value.length : 0;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (maxLength && currentLength >= maxLength && e.target.value.length > currentLength) {
        return;
      }
      onChange?.(e);
      
      // Auto-resize functionality
      if (autoResize) {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {showCharCount && maxLength && (
              <span className={`text-xs ${
                currentLength >= maxLength ? 'text-red-500' : 'text-gray-500'
              }`}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
        
        <div className="relative">
          <textarea
            className={`
              w-full px-3 py-2.5 border rounded-lg resize-vertical
              focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${focused ? 'border-green-600 focus:ring-green-600 focus:border-green-600' : 'border-gray-300'}
              text-gray-900 placeholder-gray-500 bg-white
              ${className}
            `}
            ref={ref}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            value={value}
            {...props}
          />
          
          {/* Character count indicator */}
          {showCharCount && maxLength && (
            <div className="absolute bottom-2 right-2">
              <div className={`text-xs px-2 py-1 rounded ${
                currentLength >= maxLength ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {currentLength}/{maxLength}
              </div>
            </div>
          )}
        </div>
        
        {/* Helper text and error messages */}
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
