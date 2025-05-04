import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageSearch from '../ImageSearch';

const mockResults = {
  results: [
    { thumbnail: 'cat.jpg', title: 'Cute Cat' },
    { thumbnail: 'dog.jpg', title: 'Happy Dog' },
  ]
};

const mockHistory = [
  { id: 1, search_q: 'cat', license: 'cc0', source: 'flickr', extension: 'jpg', media_type: 'image', timestamp: new Date().toISOString() },
  { id: 2, search_q: 'dog', license: 'by', source: 'wikimedia', extension: 'png', media_type: 'image', timestamp: new Date().toISOString() },
];

// Global fetch mock
beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/search_images')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResults)
      });
    }

    if (url.includes('/history/search')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockHistory.filter(h => h.search_q.includes('cat')))
      });
    }

    if (url.includes('/history')) {
      if (options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Deleted' }) });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockHistory)
      });
    }

    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('ImageSearch Full Integration', () => {
  test('performs search and displays images', async () => {
    render(<ImageSearch />);

    const input = screen.getByRole('textbox', { name: /search for images/i });
    fireEvent.change(input, { target: { value: 'cat' } });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Cute Cat')).toBeInTheDocument();
      expect(screen.getAllByRole('img')).toHaveLength(2);
    });
  });

  test('opens and filters search history', async () => {
    render(<ImageSearch />);

    fireEvent.click(screen.getByRole('button', { name: /view history/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /search history/i })).toBeInTheDocument();
    });

    const histInput = screen.getByRole('textbox', { name: /search history/i });
    fireEvent.change(histInput, { target: { value: 'cat' } });

    fireEvent.click(screen.getAllByRole('button', { name: /search history/i })[0]);

    await waitFor(() => {
      expect(screen.getByText('cat')).toBeInTheDocument();
      expect(screen.queryByText('dog')).not.toBeInTheDocument();
    });
  });

  test('applies filters before searching', async () => {
    render(<ImageSearch />);

    fireEvent.change(screen.getByRole('textbox', { name: /search for images/i }), {
      target: { value: 'dog' }
    });

    fireEvent.change(screen.getByLabelText(/license/i), { target: { value: 'cc0' } });
    fireEvent.change(screen.getByLabelText(/source/i), { target: { value: 'flickr' } });
    fireEvent.change(screen.getByLabelText(/file type/i), { target: { value: 'jpg' } });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('license=cc0'), expect.anything());
      expect(screen.getByText('Cute Cat')).toBeInTheDocument();
    });
  });

  test('clears all history', async () => {
    render(<ImageSearch />);
    fireEvent.click(screen.getByRole('button', { name: /view history/i }));

    await waitFor(() => {
      expect(screen.getByText('cat')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /clear history/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/history?media_type=image'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  test('deletes individual entry', async () => {
    render(<ImageSearch />);
    fireEvent.click(screen.getByRole('button', { name: /view history/i }));

    await waitFor(() => {
      expect(screen.getByText('cat')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/history/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
