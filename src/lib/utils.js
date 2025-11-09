import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge to handle Tailwind CSS class conflicts
 * @param {...any} inputs - Class names to be combined
 * @returns {string} Combined class names
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export { cn };
