import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Set all categories
    setCategories: (state, action) => {
      state.categories = action.payload;
      state.error = null;
    },
    // Set selected category
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    // Add category
    addCategory: (state, action) => {
      state.categories.unshift(action.payload);
    },
    // Update category
    updateCategory: (state, action) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    // Delete category
    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
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
  setCategories,
  setSelectedCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  setLoading,
  setError,
  clearError,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
