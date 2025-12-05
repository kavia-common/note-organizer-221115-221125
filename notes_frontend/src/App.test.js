import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app chrome and actions', () => {
  render(<App />);
  // Top bar brand
  expect(screen.getByText(/Notes Organizer/i)).toBeInTheDocument();
  // Actions exist
  expect(screen.getByRole('button', { name: /New Note/i })).toBeInTheDocument();
});
