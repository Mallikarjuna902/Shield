export function Badge({ className = '', children, ...props }) {
  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;

