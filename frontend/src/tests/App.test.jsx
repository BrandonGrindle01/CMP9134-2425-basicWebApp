import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock global fetch
global.fetch = jest.fn();

// Mock successful login response
const mockLoginSuccess = () => {
  fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Login successful" }),
    })
  );
};

// Clear fetch between tests
beforeEach(() => {
  fetch.mockClear();
});

describe('App Component - Auth Flow and Tabs', () => {
  test('renders login screen initially', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('transitions from login to image search after successful login', async () => {
    render(<App />);

    // Simulate typing username/password
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });

    // Mock login success
    mockLoginSuccess();

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Wait for search buttons to appear
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Image Search/i })).toBeInTheDocument()
    );

    // Check default tab is image search
    fireEvent.click(screen.getByRole('button', { name: /Image Search/i }));
    expect(screen.getByPlaceholderText(/Search for images/i)).toBeInTheDocument();
  });

  test('can switch to audio tab after login', async () => {
    render(<App />);

    // Fill login form and submit
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass' },
    });

    // Mock login response
    mockLoginSuccess();
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Wait for post-login UI
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Audio Search/i })).toBeInTheDocument()
    );

    // Switch to Audio tab
    fireEvent.click(screen.getByRole('button', { name: /Audio Search/i }));
    expect(screen.getByPlaceholderText(/Search for audio/i)).toBeInTheDocument();
  });

  test('logout returns user to login screen', async () => {
    render(<App />);

    // Simulate login
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass' },
    });

    mockLoginSuccess();
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Wait for logged-in UI
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument()
    );

    // Click logout
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Logged out" }),
      })
    );
    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
    );
  });
});
