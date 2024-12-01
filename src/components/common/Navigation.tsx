import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useTheme } from '../../context/ThemeContext';

export function Navigation() {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => `
    px-3 py-2 rounded-md text-sm font-medium
    ${isActive(path)
      ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
      : 'text-gray-700 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
    }
  `;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                Earnly
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/overview" className={navLinkClass('/overview')}>
                  Overview
                </Link>
                <Link to="/add" className={navLinkClass('/add')}>
                  Add Earning
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/dashboard" className={`block ${navLinkClass('/dashboard')}`}>
            Dashboard
          </Link>
          <Link to="/overview" className={`block ${navLinkClass('/overview')}`}>
            Overview
          </Link>
          <Link to="/add" className={`block ${navLinkClass('/add')}`}>
            Add Earning
          </Link>
        </div>
      </div>
    </nav>
  );
}
