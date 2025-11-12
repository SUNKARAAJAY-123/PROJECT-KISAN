// Quick analytics setup for components
// Import this in any component and call trackComponentUsage() in useEffect

import { track } from './analytics';

export const quickTrack = {
  // One-liner for component usage
  component: (name: string) => track.feature(name, 'view'),
  
  // One-liner for button clicks
  click: (button: string) => track.action('click', button),
  
  // One-liner for form submissions
  submit: (form: string) => track.action('submit', form),
  
  // One-liner for search
  search: (query: string) => track.action('search', query),
  
  // One-liner for errors
  error: (error: string) => track.error(error)
};

// Helper for quick component tracking
export const trackComponentUsage = (componentName: string) => {
  quickTrack.component(componentName);
};