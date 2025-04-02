import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageSearch from '../ImageSearch';

// Mock fetch for testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      results: [
        { thumbnail: 'image1.jpg', title: 'Image 1' },
        { thumbnail: 'image2.jpg', title: 'Image 2' }
      ]
    }),
  })
);

describe('ImageSearch Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders search input and button', () => {
    render(<ImageSearch />);

    expect(screen.getByPlaceholderText(/Search for images/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  test('displays initial message when no images', () => {
    render(<ImageSearch />);

    expect(screen.getByText(/No images to display/i)).toBeInTheDocument();
  });

  test('calls API and displays images when searching', async () => {
    render(<ImageSearch />);

    // Enter search term
    const input = screen.getByPlaceholderText(/Search for images/i);
    fireEvent.change(input, { target: { value: 'nature' } });

    // Click search button
    const button = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(button);

    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/search_images?q=nature');

    // Wait for images to load
    await waitFor(() => {
        expect(screen.getByText('Image 1')).toBeInTheDocument();
        expect(screen.getByText('Image 2')).toBeInTheDocument();
        expect(screen.getAllByRole('img')).toHaveLength(2);
    });
  });
});