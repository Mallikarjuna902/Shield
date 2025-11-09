export function Label({ className = '', children, ...props }) {
  return (
    <label
      {...props}
      className={`text-slate-300 ${className}`}
    >
      {children}
    </label>
  );
}

export default Label;


