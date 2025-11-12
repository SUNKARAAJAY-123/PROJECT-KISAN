import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tab, View, TFunction } from '../types';
import { translations } from '../translations';
import { HomeIcon, LeafIcon, PriceTagIcon, SchemeIcon, CloseIcon, SunIcon, MoonIcon, WeatherIcon, UserIcon, LoginIcon, LogoutIcon } from './Icons';
// import FarmerIcon from './FarmerIcon';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeView: View;
  setActiveView: (view: View) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  t: TFunction;
}

const nativeLanguageNames: { [key: string]: string } = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  bn: 'বাংলা',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  pa: 'ਪੰਜਾਬੀ',
};

type NavLinkProps = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  to?: string;
};

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick, to }) => {
  return to ? (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 focus-visible:ring-green-500 ${isActive
        ? 'bg-green-600 text-white shadow-md'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  ) : (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 focus-visible:ring-green-500 ${
        isActive
          ? 'bg-green-600 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

const ThemeToggle: React.FC<{ theme: string; setTheme: (theme: string) => void; t: TFunction }> = ({ theme, setTheme, t }) => {
  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.toggleTheme}</label>
      <button
        onClick={toggleTheme}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        aria-label={isDark ? t.lightMode : t.darkMode}
      >
        {isDark ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
        <span className="text-sm font-medium">{isDark ? t.lightMode : t.darkMode}</span>
      </button>
    </div>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activeView, setActiveView, language, onLanguageChange, theme, setTheme, t }) => {
  const { currentUser, logout } = useAuth();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 1024 && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);
  
  const handleNavClick = (view: View) => {
    setActiveView(view);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        ref={sidebarRef}
        className={`fixed lg:relative flex flex-col z-50 h-full w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl lg:shadow-none transition-transform transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 h-16 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {/* Logo removed as requested */}
              <div>
                  <h1 className="text-xl font-bold text-green-800 dark:text-green-300">{t.appTitle}</h1>
              </div>
            </div>
            <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="Close sidebar"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            icon={<HomeIcon className="w-6 h-6" />}
            label={t.dashboardTitle}
            isActive={activeView === 'Dashboard'}
            onClick={() => handleNavClick('Dashboard')}
          />
          <NavLink
            icon={<LeafIcon className="w-6 h-6" />}
            label={t.cropDoctorTab}
            isActive={activeView === Tab.CropDoctor}
            onClick={() => handleNavClick(Tab.CropDoctor)}
          />
           <NavLink
            icon={<PriceTagIcon className="w-6 h-6" />}
            label={t.marketPricesTab}
            isActive={activeView === Tab.MarketPrices}
            onClick={() => handleNavClick(Tab.MarketPrices)}
          />
           <NavLink
            icon={<SchemeIcon className="w-6 h-6" />}
            label={t.govtSchemesTab}
            isActive={activeView === Tab.GovtSchemes}
            onClick={() => handleNavClick(Tab.GovtSchemes)}
          />
          <NavLink
            icon={<WeatherIcon className="w-6 h-6" />}
            label={t.weatherTab}
            isActive={activeView === Tab.Weather}
            onClick={() => handleNavClick(Tab.Weather)}
          />
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          
          {currentUser ? null : (
            <NavLink
              icon={<LoginIcon className="w-6 h-6" />}
              label={t.signIn}
              isActive={false}
              to="/login"
              onClick={() => {}}
            />
          )}
        </nav>

        {/* Language selector above footer, left to where profile was */}
        <div className="px-4 pt-4">
          <div className="relative">
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.selectLanguage}</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            >
              {Object.keys(translations).map((langKey) => (
                <option key={langKey} value={langKey}>{nativeLanguageNames[langKey] || langKey}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Footer section with theme toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <ThemeToggle theme={theme} setTheme={setTheme} t={t} />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            {t.footerText.replace('{year}', new Date().getFullYear().toString())}
          </p>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;