// src/components/ui/input.jsx
import React from 'react';

export function Input({ className, ...props }) {
  return (
    <input
      className={`px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
