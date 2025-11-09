import { useState } from 'react';

export function Select({ value, onValueChange, children }) {
  // Container, renders children (Trigger + Content)
  return children;
}

export function SelectTrigger({ className = '', children, ...props }) {
  return (
    <button type="button" className={`w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-left ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SelectContent({ className = '', children }) {
  // Simple static container; not a real dropdown for this demo
  return <div className={`mt-2 rounded-md border border-slate-700 bg-slate-800 p-1 ${className}`}>{children}</div>;
}

export function SelectItem({ value, className = '', children, onClick }) {
  return (
    <div
      role="option"
      onClick={(e) => {
        onClick?.(e);
      }}
      className={`cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-700 ${className}`}
      data-value={value}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }) {
  return <span className="text-slate-400">{placeholder}</span>;
}


