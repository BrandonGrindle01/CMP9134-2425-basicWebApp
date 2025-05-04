import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioSearch from '../AudioSearch';

const mockResults = {
  results: [
    { audio_url: 'track1.mp3', title: 'Track 1', creator: 'Artist 1' },
    { audio_url: 'track2.mp3', title: 'Track 2', creator: 'Artist 2' },
  ]
};

const mockHistory = [
  {
    id: 1,
    search_q: 'relaxing music',
    license: 'cc0',
    source: 'jamendo',
    extension: 'mp3',
    media_type: 'audio',
    timestamp: new Date().toISOString()
  },
];

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/search_audio')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockResults) });
    }
    if (url.includes('/history/search')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockHistory) });
    }
    if (url.includes('/history')) {
      if (options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Deleted' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockHistory) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('AudioSearch Component', () => {
  test('renders input and search button', () => {
    render(<AudioSearch />);
    expect(screen.getByPlaceholderText(/search for audio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('executes search and shows audio results', async () => {
    render(<AudioSearch />);
    fireEvent.change(screen.getByPlaceholderText(/search for audio/i), {
      target: { value: 'relaxing music' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Track 1')).toBeInTheDocument();
      expect(screen.getByText('Track 2')).toBeInTheDocument();
    });
  });

  test('opens and searches audio history', async () => {
    render(<AudioSearch />);
    fireEvent.click(screen.getByText(/view history/i));

    await waitFor(() => {
      expect(screen.getByText('Audio Search History')).toBeInTheDocument();
      expect(screen.getByText('relaxing music')).toBeInTheDocument();
    });
  });

  test('clears all history entries', async () => {
    render(<AudioSearch />);
    fireEvent.click(screen.getByText(/view history/i));

    await waitFor(() => {
      expect(screen.getByText('relaxing music')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/clear history/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/history?media_type=audio'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  test('deletes a single history item', async () => {
    render(<AudioSearch />);
    fireEvent.click(screen.getByText(/view history/i));

    await waitFor(() => {
      expect(screen.getByText('relaxing music')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/delete/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/history/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
