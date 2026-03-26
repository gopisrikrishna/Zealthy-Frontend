import { render, screen } from '@testing-library/react';
import App from './App';

test('renders patient login page title', () => {
  render(<App />);
  const heading = screen.getByRole('heading', {
    name: /patient login/i,
    level: 1,
  });
  expect(heading).toBeInTheDocument();
});
