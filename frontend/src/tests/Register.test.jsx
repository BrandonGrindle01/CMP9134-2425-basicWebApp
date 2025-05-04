import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from '../Register';

describe('Register Component', () => {
  const mockSetActiveTab = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    global.fetch = jest.fn();
  });

  test('renders registration form fields', () => {
    render(<Register setActiveTab={mockSetActiveTab} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('shows error if fields are empty', async () => {
    render(<Register setActiveTab={mockSetActiveTab} />);

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    jest.useFakeTimers(); // ✅ mock timers

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ message: 'Registration successful' }),
    });

    render(<Register setActiveTab={mockSetActiveTab} />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    jest.runAllTimers(); // ✅ run setTimeout callback

    expect(mockSetActiveTab).toHaveBeenCalledWith('login');

    jest.useRealTimers(); // ✅ cleanup
  });

  test('handles error from API', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: 'Username or email already exists' }),
    });

    render(<Register setActiveTab={mockSetActiveTab} />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'existinguser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });
});