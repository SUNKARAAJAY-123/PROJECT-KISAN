import { logEvent } from 'firebase/analytics';
import { analytics } from '../src/firebaseConfig';

// Core tracking functions
export const track = {
  // Page views
  page: (page: string) => logEvent(analytics, 'page_view', { page_title: page }),
  
  // Feature usage
  feature: (feature: string, action?: string) => 
    logEvent(analytics, 'select_content', { content_type: 'feature', item_id: feature, action }),
  
  // User actions
  action: (action: string, category?: string) => 
    logEvent(analytics, action, { category }),
  
  // Errors
  error: (error: string, context?: string) => 
    logEvent(analytics, 'exception', { description: error, context })
};