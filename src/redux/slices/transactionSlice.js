import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Set all transactions
    setTransactions: (state, action) => {
      state.transactions = action.payload.data || action.payload;
      state.error = null;
    },
    // Set pagination
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    // Add transaction
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    // Update transaction
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    // Delete transaction
    deleteTransaction: (state, action) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
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
  setTransactions,
  setPagination,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setLoading,
  setError,
  clearError,
} = transactionSlice.actions;

export default transactionSlice.reducer;
