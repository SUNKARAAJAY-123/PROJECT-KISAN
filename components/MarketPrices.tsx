import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { getMarketPrices } from '../services/geminiService';
import { fetchLiveMarketPrice } from '../services/agmarknetService';
import MarkdownRenderer from './MarkdownRenderer';
import { TFunction } from '../types';


interface MarketPricesProps {
  language: string;
  t: TFunction;
}

export default function MarketPrices({ language, t }: MarketPricesProps) {

  const [query, setQuery] = useState('');
  const [result, setResult] = useState(() => {
    const cached = localStorage.getItem('marketPrices');
    return cached ? cached : '';
  });
  const [liveResult, setLiveResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addNotification } = useNotification();


  // Major query suggestions (translatable)
  const suggestions = t.majorQueries || [
    "Today's tomato rate in Vijayawada",
    "Today's paddy price in Telangana",
    "Maize price in Karnataka",
    "Cotton price in Maharashtra",
    "Groundnut price in Gujarat",
    "Wheat price in Punjab",
    "Chilli price in Guntur",
    "Onion price in Lasalgaon",
  ];

  // Clear state on unmount
  React.useEffect(() => {
    return () => {
      setQuery('');
      setResult('');
      setError('');
      localStorage.removeItem('marketPrices');
    };
  }, []);

  const handleSearch = async (customQuery?: string) => {
    const searchQuery = customQuery || query;
    if (!searchQuery.trim()) {
      setError(t.pleaseEnterQuery);
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      setLiveResult('');
      const langPrefix = language === 'hi' ? 'Answer in Hindi only.' : language === 'te' ? 'Answer in Telugu only.' : 'Answer in English only.';
      // Try to extract commodity and market from the query (simple split, can be improved)
      const match = searchQuery.match(/(\w+) price in (.+?)( today)?$/i);
      let live = '';
      if (match) {
        const commodity = match[1];
        const market = match[2];
        live = await fetchLiveMarketPrice(commodity, market);
        setLiveResult(live);
      }
      const response = await getMarketPrices(`${langPrefix} ${searchQuery}`, language);
      setResult(response);
      localStorage.setItem('marketPrices', response);
      addNotification('success', t.marketInsightsTitle + ' ' + t.searchButton);
    } catch (e: any) {
      setError(e.message || 'An error occurred while fetching market prices.');
      addNotification('error', e.message || 'An error occurred while fetching market prices.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-8 px-2 sm:px-0">
      {/* Animated background shapes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-green-400/10 rounded-full blur-2xl animate-spin-slow" />
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-3xl shadow-2xl backdrop-blur-md border border-green-100 dark:border-green-900">
          <h2 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-400 text-center">Market Prices</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center text-lg font-medium">{t.marketPricesDescription}</p>

          {/* Suggestions */}
          <div className="mb-6">
            <div className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Major Queries:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition"
                  onClick={() => { setQuery(s); handleSearch(s); }}
                  disabled={isLoading}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea for user query */}
          <div className="flex flex-col gap-2 mb-6">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.marketPricesPlaceholder}
              className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full shadow-inner min-h-[60px] resize-y"
              rows={3}
              aria-label={t.marketPricesPlaceholder}
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 shadow-lg"
            >
              {isLoading ? t.searchingButton : t.searchButton}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg animate-shake text-center">{error}</div>
          )}
          {(isLoading || result || liveResult) && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t.marketInsightsTitle}</h3>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg prose max-w-none dark:prose-invert shadow-md">
                  {liveResult && (
                    <div className="mb-2 p-3 rounded bg-blue-50 border border-blue-200 text-blue-900 text-sm">
                      <strong>Live Data:</strong> {liveResult}
                    </div>
                  )}
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