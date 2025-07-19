import axios from 'axios';
import { searchBooks } from '../../src/modules/books/services/bookService';
import { OpenLibraryResponse } from '../../src/modules/books/types/book.types';

jest.mock('axios');

const mockedAxiosGet = axios.get as jest.Mock;

describe('Unit: bookService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly parse a valid API response', async () => {
    const mockApiResponse: OpenLibraryResponse = {
      docs: [
        {
          key: '/works/OL1W',
          title: 'Book One',
          author_name: ['Author A'],
          first_sentence: ['It was a dark and stormy night.'],
          isbn: ['12345'],
          cover_i: 1,
        },
      ],
    };

    mockedAxiosGet.mockResolvedValue({ data: mockApiResponse });

    const books = await searchBooks('test');

    expect(books).toHaveLength(1);
    expect(books[0].id).toBe('/works/OL1W');
    expect(books[0].title).toBe('Book One');
    expect(books[0].description).toBe('It was a dark and stormy night.');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('should handle books with missing optional fields gracefully', async () => {
    const mockApiResponse: OpenLibraryResponse = {
      docs: [
        {
          key: '/works/OL2W',
          title: 'Book Two',
        },
      ],
    };

    mockedAxiosGet.mockResolvedValue({ data: mockApiResponse });

    const books = await searchBooks('test');

    expect(books).toHaveLength(1);
    expect(books[0].id).toBe('/works/OL2W');
    expect(books[0].authors).toEqual([]); 
    expect(books[0].isbn).toEqual([]); 
    expect(books[0].description).toBe('No description available.');
    expect(books[0].cover_image).toBe('No cover image available.');
  });

  it('should return an empty array when the API returns no docs', async () => {
    const mockApiResponse: OpenLibraryResponse = { docs: [] };
    mockedAxiosGet.mockResolvedValue({ data: mockApiResponse });

    const books = await searchBooks('empty');

    expect(books).toHaveLength(0);
  });
});
