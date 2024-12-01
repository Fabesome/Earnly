import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface ActionButtonProps {
  to: string;
  children?: ReactNode;
  icon?: string;
  className?: string;
}

export function ActionButton({ to, children, icon = 'plus', className = '' }: ActionButtonProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-ios shadow-ios hover:bg-primary/90 transition-colors duration-200 ${className} ${!children ? 'fixed bottom-6 right-6 w-14 h-14 rounded-full justify-center' : ''}`}
      aria-label={children?.toString() || "Add new earning"}
    >
      {icon === 'plus' && (
        <svg
          className={`${children ? 'w-5 h-5' : 'w-8 h-8'} text-white`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      )}
      {children}
    </Link>
  );
}
