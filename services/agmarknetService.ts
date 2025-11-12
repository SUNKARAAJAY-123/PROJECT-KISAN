// Agmarknet API endpoint and resource ID
const AGMARKNET_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = import.meta.env.VITE_AGMARKNET_API_KEY || 'AIzaSyCPSM9pBw0M5WsvbBZhGk451CbB7ayncWY';

/**
 * Fetches the latest market price for a given commodity and market (location).
 * @param {string} commodity - The crop/commodity name (e.g., 'Onion')
 * @param {string} market - The market/location name (e.g., 'Lasalgaon')
 * @returns {Promise<string>} - The latest price as a string, or a not found message.
 */
export async function fetchLiveMarketPrice(commodity: string, market: string): Promise<string> {
  try {
    const params = new URLSearchParams({
      'api-key': API_KEY,
      format: 'json',
      filters: `commodity:${commodity}|market:${market}`,
      limit: '1',
      sort: 'arrival_date desc',
    });
    const response = await fetch(`${AGMARKNET_API_URL}?${params.toString()}`);
    const data = await response.json();
    const records = data.records;
    if (records && records.length > 0) {
      const price = records[0].modal_price;
      const date = records[0].arrival_date;
      return `${commodity} price in ${market} on ${date}: ₹${price} per quintal.`;
    } else {
      return `No data available for ${commodity} price in ${market} today.`;
    }
  } catch (error) {
    return 'Error fetching live market price.';
  }
}
