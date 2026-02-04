import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ships: [],
  selectedShip: null,
  loading: false,
  error: null,
};

const shipSlice = createSlice({
  name: 'ships',
  initialState,
  reducers: {
    // Set all ships
    setShips: (state, action) => {
      state.ships = action.payload;
      state.error = null;
    },
    // Set selected ship
    setSelectedShip: (state, action) => {
      state.selectedShip = action.payload;
    },
    // Add ship
    addShip: (state, action) => {
      state.ships.unshift(action.payload);
    },
    // Update ship
    updateShip: (state, action) => {
      const index = state.ships.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.ships[index] = action.payload;
      }
    },
    // Delete ship
    deleteShip: (state, action) => {
      state.ships = state.ships.filter(s => s.id !== action.payload);
    },
    // Set loading
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setShips,
  setSelectedShip,
  addShip,
  updateShip,
  deleteShip,
  setLoading,
  setError,
  clearError,
} = shipSlice.actions;

export default shipSlice.reducer;
