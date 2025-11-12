import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Tab, TFunction, View } from '../types';
import { translations } from '../translations';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import CropDoctor from '../components/CropDoctor';
import MarketPrices from '../components/MarketPrices';
import GovtSchemes from '../components/GovtSchemes';
import Weather from '../components/Weather';
import KisanDostChat from '../components/KisanDostChat';
import { ChatIcon } from '../components/Icons';
import { app, analytics } from "./firebaseConfig";
import ErrorBoundary from '../components/ErrorBoundary';
import './responsive.css';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import { LanguageProvider, LanguageContext } from '../contexts/LanguageContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import type { LanguageCode } from '../translations';


// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Main content component
const MainContent: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(() => {
    const saved = localStorage.getItem('activeView');
    return (saved as View) || 'Dashboard';
  });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const { language } = React.useContext(LanguageContext);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const t = translations[language as LanguageCode];

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Track page views
  useEffect(() => {
    // Implementation of page tracking
    const trackPage = (page: string) => {
      if (analytics) {
        // Track page view
      }
    };
    
    trackPage(activeView);
  }, [activeView]);


  // Persist activeView to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  // Use LanguageContext to update language
  const { setLanguage } = React.useContext(LanguageContext);
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as LanguageCode);
  };

  const renderContent = useCallback(() => {
    switch (activeView) {
      case Tab.CropDoctor:
        return <CropDoctor language={language} t={t as any} />;
      case Tab.MarketPrices:
        return <MarketPrices language={language} t={t as any} />;
      case Tab.GovtSchemes:
        return <GovtSchemes language={language} t={t as any} />;
      case Tab.Weather:
        return <Weather language={language} t={t as any} />;
      case 'Dashboard':
      default:
        return <Dashboard setView={setActiveView} t={t} />;
    }
  }, [activeView, language, t, setActiveView]);
  
  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        setTheme={setTheme}
        t={t}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          activeView={activeView}
          t={t}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div key={activeView} className="animate-fade-in-up">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {!isChatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
          aria-label="Open Kisan Dost Chat"
        >
          <ChatIcon className="w-8 h-8" />
        </button>
      )}

  <KisanDostChat isOpen={isChatOpen} onClose={() => setChatOpen(false)} language={language} t={t as any} />
    </div>
  );
};

// Main App component
export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              <LanguageContext.Consumer>
                {({ language }) => (
                  <Routes>
                    <Route path="/login" element={<Login language={language} t={translations[language]} />} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile language={language} t={translations[language]} />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/*" element={
                      <ProtectedRoute>
                        <MainContent />
                      </ProtectedRoute>
                    } />
                  </Routes>
                )}
              </LanguageContext.Consumer>
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}