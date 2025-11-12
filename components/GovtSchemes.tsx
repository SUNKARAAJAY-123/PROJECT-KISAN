import React, { useState } from 'react';
import { getGovtSchemes } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { TFunction } from '../types';



interface GovtSchemesProps {
  language: string;
  t: TFunction;
}

export default function GovtSchemes({ language, t }: GovtSchemesProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  // Example schemes data
  const schemes = [
    {
      name: 'PM-KISAN Samman Nidhi',
      description: 'Income support of Rs. 6,000/year to all farmer families.',
      lastDate: '2025-09-30',
      status: 'open',
    },
    {
      name: 'Pradhan Mantri Fasal Bima Yojana',
      description: 'Crop insurance scheme for farmers.',
      lastDate: '2025-10-15',
      status: 'open',
    },
    {
      name: 'PM Kisan Maan Dhan Yojana',
      description: 'Pension scheme for small & marginal farmers.',
      lastDate: '2025-09-25',
      status: 'open',
    },
    {
      name: 'Kisan Credit Card (KCC)',
      description: 'Credit facility for farmers at low interest.',
      lastDate: '2025-12-31',
      status: 'open',
    },
    {
      name: 'PM Krishi Sinchai Yojana',
      description: 'Irrigation scheme for water conservation.',
      lastDate: '2025-11-10',
      status: 'upcoming',
      upcomingDate: '2025-10-01',
    },
    {
      name: 'National Food Security Mission',
      description: 'Increase production of rice, wheat, pulses, etc.',
      lastDate: '2025-11-20',
      status: 'upcoming',
      upcomingDate: '2025-10-15',
    },
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
        setError(t.pleaseEnterQuery);
        return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const response = await getGovtSchemes(query, language);
      setResult(response);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while fetching scheme information.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-8 px-2 sm:px-0">
      {/* Animated background shapes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-green-400/10 rounded-full blur-2xl animate-spin-slow" />
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-3xl shadow-2xl backdrop-blur-md border border-green-100 dark:border-green-900">
          <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400 text-center">Government Schemes for Farmers</h2>

          {/* Schemes List */}
          <div className="mb-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {schemes.map((scheme, idx) => (
                <div
                  key={idx}
                  className={`relative group p-4 rounded-xl border shadow transition-all duration-200 ${scheme.status === 'upcoming' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 opacity-80 cursor-not-allowed' : 'border-green-200 bg-green-50 dark:bg-green-900/20'}`}
                  title={scheme.status === 'upcoming' ? `Upcoming: Opens on ${scheme.upcomingDate}` : ''}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg text-green-800 dark:text-green-200">{scheme.name}</span>
                    {scheme.status === 'upcoming' && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-yellow-300 text-yellow-900 text-xs font-bold animate-pulse" title={`Upcoming: Opens on ${scheme.upcomingDate}`}>Upcoming</span>
                    )}
                  </div>
                  <div className="text-gray-700 dark:text-gray-200 mb-2 text-sm">{scheme.description}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {scheme.status === 'open' ? (
                      <>
                        <span className="font-medium">Last Date:</span> <span className="font-semibold text-red-600 dark:text-red-400">{scheme.lastDate}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Opens on:</span> <span className="font-semibold text-yellow-700 dark:text-yellow-300">{scheme.upcomingDate}</span>
                      </>
                    )}
                  </div>
                  {/* Apply Button */}
                  <button
                    className={`mt-2 px-4 py-2 rounded-lg font-semibold shadow transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${scheme.status === 'open' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    disabled={scheme.status !== 'open'}
                    onClick={() => {
                      if (scheme.status === 'open') {
                        setSelectedScheme(scheme);
                        setShowModal(true);
                      }
                    }}
                  >
                    Apply Now
                  </button>
                  {scheme.status === 'upcoming' && (
                    <div className="absolute inset-0 bg-yellow-100/60 dark:bg-yellow-900/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-yellow-900 dark:text-yellow-200 text-sm font-semibold transition-opacity pointer-events-none">
                      Upcoming scheme! Registration opens soon.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal for Apply Now */}
          {showModal && selectedScheme && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-2 text-green-700 dark:text-green-300">Apply for {selectedScheme.name}</h3>
                <div className="mb-4 text-gray-700 dark:text-gray-200">{selectedScheme.description}</div>
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Last Date:</span> <span className="font-semibold text-red-600 dark:text-red-400">{selectedScheme.lastDate}</span>
                </div>
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-800 dark:text-green-200">
                  <span className="font-semibold">Note:</span> This is a demo. Actual application integration can be added here.<br />
                  Please visit the official government portal or contact your local agriculture office to complete your application.
                </div>
                <button
                  className="w-full mt-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center text-lg font-medium">{t.govtSchemesDescription}</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.govtSchemesPlaceholder}
              className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full shadow-inner"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 shadow-lg"
            >
              {isLoading ? t.searchingButton : t.searchButton}
            </button>
          </div>
          {error && <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg animate-shake text-center">{error}</div>}
          {(isLoading || result) && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t.schemeInfoTitle}</h3>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse mt-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg prose max-w-none dark:prose-invert shadow-md">
                  <MarkdownRenderer content={result} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}