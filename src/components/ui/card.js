export function Card({ className = '', children, ...props }) {
  return (
    <div
      {...props}
      className={`rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm shadow-lg shadow-slate-900/30 relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 pointer-events-none"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default Card;
