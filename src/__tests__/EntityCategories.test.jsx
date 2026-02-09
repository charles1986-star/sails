import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import EntityCategories from '../pages/admin/EntityCategories';
import axios from 'axios';
import { Provider } from 'react-redux';
import store from '../redux/store';

jest.mock('axios');

describe('EntityCategories', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { data: [ { id:1, name: 'Root', description: 'root', parent_id: null, display_order:0 }, { id:2, name:'Child', description:'child', parent_id:1, display_order:0 } ] } });
  });

  it('renders categories and save button for books', async () => {
    render(
      <Provider store={store}>
        <EntityCategories />
      </Provider>
    );

    // wait for loading to finish
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByText(/Categories Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Order/i)).toBeInTheDocument();
    expect(screen.getByText(/Root/)).toBeInTheDocument();
    expect(screen.getByText(/Child/)).toBeInTheDocument();
  });
});
