import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TFunction } from '../types';
import { track } from '../utils/analytics';

interface ProfileProps {
  language: string;
  t: TFunction;
}

const Profile: React.FC<ProfileProps> = ({ language, t }) => {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('profile_phone') || '');
  const [address, setAddress] = useState(() => localStorage.getItem('profile_address') || '');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await updateUserProfile(displayName);
  // Store phone and address in localStorage
  localStorage.setItem('profile_phone', phone);
  localStorage.setItem('profile_address', address);
  setMessage(t.profileUpdateSuccess);
      track.action('profile_update_success', 'user');
      setEditMode(false);
    } catch (err: any) {
      setError(err.message);
      track.error('profile_update_error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAddress(`Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
      },
      (err) => {
        setError('Unable to retrieve your location.');
      }
    );
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-100 via-white to-green-200 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        className="absolute top-6 left-6 z-20 flex items-center gap-1 px-3 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow hover:bg-green-100 dark:hover:bg-green-900 transition text-green-700 dark:text-green-300 font-bold text-lg"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <span aria-hidden="true">&#8592;</span> {/* Unicode left arrow */}
      </button>
      {/* Animated background shapes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-green-400/10 rounded-full blur-2xl animate-spin-slow" />
      </div>
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl backdrop-blur-md border border-green-100 dark:border-green-900 p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-3xl font-bold text-green-700 dark:text-green-300 drop-shadow-sm">{t.profile}</h2>
            <p className="text-gray-500 dark:text-gray-300 text-sm font-medium">{t.manageYourAccount}</p>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-shake" role="alert" aria-live="assertive">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative animate-fadeIn" role="alert" aria-live="polite">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.email}</span>
              <span className="text-sm text-gray-900 dark:text-white">{currentUser.email}</span>
            </div>
            {!editMode && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.displayName}</span>
                  <span className="text-sm text-gray-900 dark:text-white">{displayName}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.phone || 'Phone Number'}</span>
                  <span className="text-sm text-gray-900 dark:text-white">{phone || '-'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.address || 'Address'}</span>
                  <span className="text-sm text-gray-900 dark:text-white">{address || '-'}</span>
                </div>
                <button
                  className="w-full mt-4 py-2 px-4 rounded-xl bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
                  onClick={() => setEditMode(true)}
                >
                  {t.editProfile || 'Edit Profile'}
                </button>
              </>
            )}
            {editMode && (
              <form className="mt-4 space-y-4" onSubmit={handleUpdateProfile} autoComplete="on" aria-label={t.profile}>
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t.displayName}
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t.phone || 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t.address || 'Address'}
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                  />
                  <button
                    type="button"
                    className="mt-2 px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs font-semibold"
                    onClick={handleGetLocation}
                  >
                    {t.useGps || 'Use GPS Location'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    aria-busy={loading}
                  >
                    {loading ? t.updating : t.updateProfile}
                  </button>
                  <button
                    type="button"
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setEditMode(false)}
                  >
                    {t.cancel || 'Cancel'}
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {/* After update, show Back to Profile instead of Sign Out */}
          {message ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-all duration-200"
              >
                {t.backToProfile || 'Back to Profile'}
              </button>
            </div>
          ) : null}
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          {t.footerText.replace('{year}', new Date().getFullYear().toString())}
        </div>
      </div>
    </div>
  );
};

export default Profile;