import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Community from '../../components/Community';

describe('Community', () => {
  it('renders forum title and post input', () => {
    render(<Community />);
    expect(screen.getByText('Kisan Community Forum')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Share something...')).toBeInTheDocument();
  });

  it('can add a new post', () => {
    render(<Community />);
    fireEvent.change(screen.getByPlaceholderText('Share something...'), { target: { value: 'Test post' } });
    fireEvent.click(screen.getByText('Post'));
    expect(screen.getByText('Test post')).toBeInTheDocument();
  });
});
