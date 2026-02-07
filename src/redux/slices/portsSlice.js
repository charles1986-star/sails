import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ports: [],
  loading: false,
  error: null,
  selectedPort: null,
};

const portsSlice = createSlice({
  name: 'ports',
  initialState,
  reducers: {
    // Set all ports
    setPorts: (state, action) => {
      state.ports = action.payload.data || action.payload;
      state.error = null;
    },
    // Add port
    addPort: (state, action) => {
      state.ports.unshift(action.payload);
    },
    // Update port
    updatePort: (state, action) => {
      const index = state.ports.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.ports[index] = action.payload;
      }
    },
    // Delete port
    deletePort: (state, action) => {
      state.ports = state.ports.filter(p => p.id !== action.payload);
    },
    // Set selected port
    setSelectedPort: (state, action) => {
      state.selectedPort = action.payload;
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
  setPorts,
  addPort,
  updatePort,
  deletePort,
  setSelectedPort,
  setLoading,
  setError,
  clearError,
} = portsSlice.actions;

export default portsSlice.reducer;
