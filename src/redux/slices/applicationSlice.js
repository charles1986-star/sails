import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  applications: [],
  myApplications: [],
  selectedApplication: null,
  loading: false,
  error: null,
};

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    // Set all applications (admin)
    setApplications: (state, action) => {
      state.applications = action.payload;
      state.error = null;
    },
    // Set user's applications
    setMyApplications: (state, action) => {
      state.myApplications = action.payload;
      state.error = null;
    },
    // Set selected application
    setSelectedApplication: (state, action) => {
      state.selectedApplication = action.payload;
    },
    // Add application
    addApplication: (state, action) => {
      state.myApplications.unshift(action.payload);
    },
    // Update application
    updateApplication: (state, action) => {
      // Update in admin list
      const adminIndex = state.applications.findIndex(a => a.id === action.payload.id);
      if (adminIndex !== -1) {
        state.applications[adminIndex] = action.payload;
      }
      // Update in user list
      const userIndex = state.myApplications.findIndex(a => a.id === action.payload.id);
      if (userIndex !== -1) {
        state.myApplications[userIndex] = action.payload;
      }
    },
    // Delete application
    deleteApplication: (state, action) => {
      state.applications = state.applications.filter(a => a.id !== action.payload);
      state.myApplications = state.myApplications.filter(a => a.id !== action.payload);
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
  setApplications,
  setMyApplications,
  setSelectedApplication,
  addApplication,
  updateApplication,
  deleteApplication,
  setLoading,
  setError,
  clearError,
} = applicationSlice.actions;

export default applicationSlice.reducer;
