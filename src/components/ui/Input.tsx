import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// BDT Icon Component
const BDTIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">৳</text>
  </svg>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  icon?: React.ReactNode;
  loading?: boolean;
  success?: boolean;
  showBDTIcon?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '', 
    label, 
    error, 
    helperText, 
    showCharCount = false,
    maxLength,
    icon,
    loading = false,
    success = false,
    showBDTIcon = false,
    value = '',
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const isPassword = props.type === 'password';
    const currentLength = typeof value === 'string' ? value.length : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (maxLength && currentLength >= maxLength && e.target.value.length > currentLength) {
        return;
      }
      onChange?.(e);
    };

    const getInputType = () => {
      if (isPassword) {
        return showPassword ? 'text' : 'password';
      }
      return props.type || 'text';
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
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          {showBDTIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <BDTIcon />
            </div>
          )}
          
          <input
              className={`
                w-full px-3 py-2.5 border rounded-lg
                focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${icon || showBDTIcon ? 'pl-10' : 'pl-3'}
                ${isPassword ? 'pr-10' : 'pr-3'}
                ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                ${success ? 'border-green-600 focus:ring-green-600 focus:border-green-600' : ''}
                ${focused ? 'border-green-600 focus:ring-green-600 focus:border-green-600' : 'border-gray-300'}
                ${loading ? 'bg-gray-50' : 'bg-white'}
                text-gray-900 placeholder-gray-500
                ${className}
              `}
              ref={ref}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              type={getInputType()}
              value={value}
              placeholder={props.placeholder}
              {...props}
            />
          
          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            
            {success && !loading && (
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {isPassword && !loading && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            
            {error && !loading && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
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
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
