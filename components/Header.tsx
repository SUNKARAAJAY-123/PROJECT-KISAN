import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MenuIcon } from './Icons';
import { TFunction, View } from '../types';

interface HeaderProps {
    onMenuClick: () => void;
    activeView: View;
    t: TFunction;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, activeView, t }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const getTitle = () => {
    switch(activeView) {
        case 'Dashboard': return t.dashboardTitle;
        case 'CropDoctor': return t.cropDoctorTab;
        case 'MarketPrices': return t.marketPricesTab;
        case 'GovtSchemes': return t.govtSchemesTab;
        case 'Weather': return t.weatherTab;
        default: return t.appTitle;
    }
  }

  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center h-16 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500"
          aria-label="Open sidebar"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <div className="flex-1 flex justify-center lg:justify-start">
           <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{getTitle()}</h1>
        </div>
        {/* Profile/Login button at top right */}
        <div className="flex items-center ml-auto">
          {currentUser ? (
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition focus:outline-none"
              >
                <span className="inline-block w-8 h-8 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-lg">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{currentUser.displayName || currentUser.email}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-auto transition-opacity z-50">
                <a
                  href="/profile"
                  className="block px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-green-100 dark:hover:bg-green-900 rounded-t-lg"
                >
                  {t.profile || 'Profile'}
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-b-lg"
                >
                  {t.signOut || 'Sign Out'}
                </button>
              </div>
            </div>
          ) : (
            <a
              href="/login"
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition hidden sm:inline-block"
              style={{ marginLeft: 'auto' }}
            >
              {t.loginButton || 'Log In'}
            </a>
          )}
        </div>
    </header>
  );
};

export default Header;