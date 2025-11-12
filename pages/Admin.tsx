import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdminDashboard from '../components/AdminDashboard';
import { Navigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { translations } = useLanguage();

  // Check if user is admin (you can implement your own admin check logic)
  const isAdmin = user?.email?.includes('admin') || user?.email === 'admin@projectkisan.com';

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-red-100 via-white to-red-200 dark:from-gray-900 dark:via-gray-800 dark:to-red-900">
        {/* Animated background shapes */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-300/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-red-400/10 rounded-full blur-2xl animate-spin-slow" />
        </div>
        <div className="relative z-10 max-w-md w-full bg-white/90 dark:bg-gray-800/90 p-8 rounded-3xl shadow-2xl backdrop-blur-md border border-red-100 dark:border-red-900 flex flex-col items-center gap-4">
          <img src="/icons/shield-3d.svg" alt="Access Denied" className="w-16 h-16 drop-shadow-lg animate-bounce" />
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
            You don't have permission to access the admin panel.
          </p>
          <a href="/" className="text-blue-600 hover:underline font-medium transition-colors">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard t={translations} />
      </div>
    </div>
  );
};

export default Admin;