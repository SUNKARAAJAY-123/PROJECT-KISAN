import React from 'react';
import { Tab, TFunction, View } from '../types';
import ToolCard from './ToolCard';
import { LeafIcon, PriceTagIcon, SchemeIcon, WeatherIcon } from './Icons';
import { useFeatureTracking } from '../utils/useAnalytics';
import ResponsiveGrid from './ResponsiveGrid';

interface DashboardProps {
  setView: (view: View) => void;
  t: TFunction;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, t }) => {
  const { trackFeature } = useFeatureTracking();

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning || 'Good Morning';
    if (hour < 18) return t.goodAfternoon || 'Good Afternoon';
    return t.goodEvening || 'Good Evening';
  };

  // TODO: Replace with actual user name from context/profile
  const userName = 'Kisan';

  const handleToolClick = (view: View, toolName: string) => {
    trackFeature(toolName, 'click');
    setView(view);
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center">
      {/* Animated background shapes for 3D/modern look */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-100 dark:bg-green-900 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-100 dark:bg-green-800 rounded-full blur-2xl opacity-30 animate-pulse" />
      </div>
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-green-700 dark:text-green-300 drop-shadow-lg flex items-center justify-center gap-2 animate-fade-in-up">
            {getGreeting()}, {userName} <span role="img" aria-label="farmer">🌾</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 animate-fade-in-up delay-100">{t.dashboardDescription}</p>
        </div>
        <ResponsiveGrid columns={{ sm: 1, md: 2 }} gap={8} className="mt-6">
          <ToolCard
            icon={<LeafIcon className="w-12 h-12 drop-shadow-2xl" />}
            title={t.cropDoctorCardTitle}
            description={t.cropDoctorCardDescription}
            onClick={() => handleToolClick(Tab.CropDoctor, 'crop_doctor')}
            ariaLabel={t.cropDoctorCardTitle}
          />
          <ToolCard
            icon={<PriceTagIcon className="w-12 h-12 drop-shadow-2xl" />}
            title={t.marketPricesCardTitle}
            description={t.marketPricesCardDescription}
            onClick={() => handleToolClick(Tab.MarketPrices, 'market_prices')}
            ariaLabel={t.marketPricesCardTitle}
          />
          <ToolCard
            icon={<SchemeIcon className="w-12 h-12 drop-shadow-2xl" />}
            title={t.govtSchemesCardTitle}
            description={t.govtSchemesCardDescription}
            onClick={() => handleToolClick(Tab.GovtSchemes, 'govt_schemes')}
            ariaLabel={t.govtSchemesCardTitle}
          />
          <ToolCard
            icon={<WeatherIcon className="w-12 h-12 drop-shadow-2xl" />}
            title={t.weatherCardTitle}
            description={t.weatherCardDescription}
            onClick={() => handleToolClick(Tab.Weather, 'weather')}
            ariaLabel={t.weatherCardTitle}
          />
        </ResponsiveGrid>
      </div>
    </div>
  );
};

export default Dashboard;