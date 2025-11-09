import { useState, cloneElement } from 'react';

export function DropdownMenu({ children }) {
  return <div className="relative inline-block text-left">{children}</div>;
}

export function DropdownMenuTrigger({ asChild = false, children }) {
  if (asChild && children) return children;
  return <button type="button">{children}</button>;
}

export function DropdownMenuContent({ children, className = '', align = 'end' }) {
  const alignment = align === 'end' ? 'right-0' : 'left-0';
  return (
    <div className={`absolute z-50 mt-2 min-w-[10rem] ${alignment} rounded-md border border-slate-700 bg-slate-800 p-1 shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, className = '', onClick, ...props }) {
  return (
    <div
      role="menuitem"
      onClick={onClick}
      {...props}
      className={`cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-700 ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = '' }) {
  return <div className={`my-1 h-px bg-slate-700 ${className}`} />;
}

