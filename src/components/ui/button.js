export function Button({ className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 border border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800/70 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
