import React, { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { getWeatherForecast } from '../services/geminiService';
import { TFunction, WeatherData } from '../types';
import { SunIcon, CloudIcon, RainIcon, PartlyCloudyIcon } from './Icons';

interface WeatherProps {
  language: string;
  t: TFunction;
}

const WeatherIconDisplay: React.FC<{ condition: string; className?: string }> = ({ condition, className = 'w-16 h-16' }) => {
    const lowerCaseCondition = condition.toLowerCase();
    if (lowerCaseCondition.includes('sun') || lowerCaseCondition.includes('clear')) {
        return <SunIcon className={className} />;
    }
    if (lowerCaseCondition.includes('partly cloudy')) {
        return <PartlyCloudyIcon className={className} />;
    }
    if (lowerCaseCondition.includes('cloud') || lowerCaseCondition.includes('overcast')) {
        return <CloudIcon className={className} />;
    }
    if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle') || lowerCaseCondition.includes('shower')) {
        return <RainIcon className={className} />;
    }
    return <CloudIcon className={className} />; // Default icon
};

const LoadingSkeleton: React.FC = () => (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="p-6 bg-gray-100 dark:bg-gray-700/50 rounded-2xl mb-6">
            <div className="h-20 w-20 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto mb-3"></div>
                    <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3"></div>
                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
                </div>
            ))}
        </div>
    </div>
);


export default function Weather({ language, t }: WeatherProps) {
    const [query, setQuery] = useState('');
    const [weatherData, setWeatherData] = useState<WeatherData | null>(() => {
        const cached = localStorage.getItem('weatherData');
        return cached ? JSON.parse(cached) : null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { addNotification } = useNotification();

    const handleSearch = async () => {
        if (!query.trim()) {
            setError(t.pleaseEnterQuery);
            return;
        }
        setIsLoading(true);
        setError('');
        setWeatherData(null);
        try {
            const response = await getWeatherForecast(query, language);
            if (response.error) {
                setError(response.error);
                addNotification('error', response.error);
            } else {
                setWeatherData(response);
                localStorage.setItem('weatherData', JSON.stringify(response));
                // Notify for severe weather or success
                const severe = /storm|rain|thunder|cyclone|hail|flood|alert|warning/i.test(response.current.condition);
                if (severe) {
                    addNotification('warning', `Severe weather alert: ${response.current.condition}`);
                } else {
                    addNotification('success', t.getForecastButton + ' ' + t.currentWeatherTitle.replace('{location}', response.location));
                }
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred while fetching the weather forecast.");
            addNotification('error', e.message || "An error occurred while fetching the weather forecast.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-8 px-2 sm:px-0">
            {/* Animated background shapes */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-green-400/10 rounded-full blur-2xl animate-spin-slow" />
            </div>
            <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-3xl shadow-2xl backdrop-blur-md border border-green-100 dark:border-green-900">
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-center text-lg font-medium">{t.weatherDescription}</p>
                    <div className="flex flex-col sm:flex-row gap-2 mb-6">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t.weatherPlaceholder}
                            className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full shadow-inner"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 shadow-lg"
                        >
                            {isLoading ? t.gettingForecastButton : t.getForecastButton}
                        </button>
                    </div>
                    {error && <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg animate-shake text-center">{error}</div>}
                    {isLoading && <LoadingSkeleton />}
                    {weatherData && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                                {t.currentWeatherTitle.replace('{location}', weatherData.location)}
                            </h3>
                            {/* Current Weather */}
                            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl mb-8 flex flex-col items-center text-center shadow-lg">
                                <div className="text-yellow-500 dark:text-yellow-400">
                                    <WeatherIconDisplay condition={weatherData.current.condition} className="w-24 h-24" />
                                </div>
                                <p className="text-6xl font-bold text-gray-800 dark:text-gray-100 mt-2 drop-shadow-lg">{Math.round(weatherData.current.temp_c)}°C</p>
                                <p className="text-lg font-medium text-gray-600 dark:text-gray-300 capitalize">{weatherData.current.condition}</p>
                                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>Humidity: {weatherData.current.humidity}%</span>
                                    <span>Wind: {weatherData.current.wind_kph} kph</span>
                                </div>
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{t.forecastTitle}</h4>
                                                        {/* 5-Day Forecast */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                                                                                                {weatherData.forecast.map((day, index) => {
                                                                                                    // Always calculate the date from today, and derive the correct day name from the date
                                                                                                    const today = new Date();
                                                                                                    const forecastDate = new Date(today);
                                                                                                    forecastDate.setDate(today.getDate() + index + 1); // +1: forecast starts from tomorrow
                                                                                                    const dateStr = forecastDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
                                                                                                    const dayName = forecastDate.toLocaleDateString(undefined, { weekday: 'long' });
                                                                                                    return (
                                                                                                        <div key={index} className="flex flex-col items-center p-3 sm:p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl text-center shadow-md">
                                                                                                                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">{dayName}</p>
                                                                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{dateStr}</p>
                                                                                                                <div className="my-2 text-blue-500 dark:text-blue-400">
                                                                                                                        <WeatherIconDisplay condition={day.condition} className="w-10 h-10 sm:w-12 sm:h-12" />
                                                                                                                </div>
                                                                                                                <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm sm:text-base">{Math.round(day.high_c)}° / {Math.round(day.low_c)}°</p>
                                                                                                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize hidden sm:block">{day.condition}</p>
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                        </div>
                            {/* Weather Analysis */}
                            {weatherData.analysis && (
                              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-900 dark:text-blue-200 text-center text-base font-medium shadow">
                                <span className="font-semibold">5-Day Analysis:</span> {weatherData.analysis}
                              </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}