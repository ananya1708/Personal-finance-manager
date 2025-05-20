// src/components/ui/button.jsx
import React from 'react';

export function Button({ children, className, ...props }) {
  return (
    <button
      className={`py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
