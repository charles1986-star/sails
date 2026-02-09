import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminBooksAnalytics from '../pages/admin/AdminBooksAnalytics';
import axios from 'axios';
import { Provider } from 'react-redux';
import store from '../redux/store';

jest.mock('axios');

describe('AdminBooksAnalytics', () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.endsWith('/books/stats')) {
        return Promise.resolve({ data: { data: { total_books: 5, total_downloads: 10, total_purchases: 2, revenue: 19.99, popular: [], topCats: [] } } });
      }
      if (url.endsWith('/books/stats/timeseries')) {
        const d = [];
        const now = new Date();
        for (let i=13;i>=0;i--) {
          const day = new Date(now.getTime() - i*24*60*60*1000).toISOString().slice(0,10);
          d.push({ day, downloads: Math.floor(Math.random()*10), purchases: Math.floor(Math.random()*5), revenue: Math.random()*10 });
        }
        return Promise.resolve({ data: { data: d } });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  it('renders analytics and chart', async () => {
    render(
      <Provider store={store}>
        <AdminBooksAnalytics />
      </Provider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByText(/Books Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Books/i)).toBeInTheDocument();
    // chart renders as svg
    await waitFor(() => expect(document.querySelector('svg')).toBeInTheDocument());
  });
});
