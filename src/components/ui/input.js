export function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${className}`}
    />
  );
}

export default Input;


