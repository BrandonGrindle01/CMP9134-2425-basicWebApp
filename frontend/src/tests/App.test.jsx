import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

global.fetch = jest.fn();

const mockLoginSuccess = () => {
  fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: 'Login successful' }),
    })
  );
};

beforeEach(() => {
  fetch.mockClear();
});

describe('App Component - Auth Flow and Tabs', () => {
  test('renders login screen initially', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('transitions from login to image search after successful login', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    mockLoginSuccess();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /image search/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /image search/i }));
    expect(screen.getByPlaceholderText(/search for images/i)).toBeInTheDocument();
  });

  test('can switch to audio tab after login', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'pass' },
    });
    mockLoginSuccess();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /audio search/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /audio search/i }));
    expect(screen.getByPlaceholderText(/search for audio/i)).toBeInTheDocument();
  });

  test('logout returns user to login screen', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'pass' },
    });
    mockLoginSuccess();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Logged out' }),
      })
    );
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });
});
