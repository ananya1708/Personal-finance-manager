import React from 'react';

export function Card({ children, className, ...props }) {
  return (
    <div className={`bg-white shadow-md rounded-lg ${className}`} {...props}>
      {children}
    </div>
  );
}