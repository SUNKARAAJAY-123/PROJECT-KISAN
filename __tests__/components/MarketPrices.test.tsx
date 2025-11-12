import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the geminiService to avoid ESM import errors
jest.mock('../../services/geminiService', () => ({
  fetchMarketInsights: jest.fn(() => Promise.resolve('Mocked market insights')),
}));

import MarketPrices from '../../components/MarketPrices';


import { translations } from '../../translations';

describe('MarketPrices', () => {
  const t = translations.en;

  it('renders input and button', () => {
    render(<MarketPrices language="en" t={t} />);
  expect(screen.getByPlaceholderText(t.marketPricesPlaceholder)).toBeInTheDocument();
  expect(screen.getByText(t.searchButton)).toBeInTheDocument();
  });

  it('shows error if search is clicked with empty input', async () => {
    render(<MarketPrices language="en" t={t} />);
  fireEvent.click(screen.getByText(t.searchButton));
    await waitFor(() => {
  expect(screen.getByText(t.pleaseEnterQuery)).toBeInTheDocument();
    });
  });
});
