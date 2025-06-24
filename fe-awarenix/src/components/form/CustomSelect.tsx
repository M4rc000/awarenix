import React from 'react';

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
  return (
    <div className="relative">
      <select
        className={`
          appearance-none
          block w-full px-4 py-3
          text-base
          border border-gray-300 dark:border-gray-700
          rounded-lg
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          shadow-sm
          transition-all duration-200 ease-in-out
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          dark:focus:ring-blue-400 dark:focus:border-blue-400
          cursor-pointer
          pr-10
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </select>
      {/* Custom arrow icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 010-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default Select;