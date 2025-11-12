import { useEffect } from 'react';
import { track } from './analytics';

// Auto-track page views
export const usePageTracking = (pageName: string) => {
  useEffect(() => {
    track.page(pageName);
  }, [pageName]);
};

// Track feature usage
export const useFeatureTracking = () => ({
  trackFeature: (feature: string, action = 'view') => track.feature(feature, action),
  trackAction: (action: string, category?: string) => track.action(action, category)
});