import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import shipReducer from './slices/shipSlice';
import applicationReducer from './slices/applicationSlice';
import transactionReducer from './slices/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ships: shipReducer,
    applications: applicationReducer,
    transactions: transactionReducer,
  },
});

export default store;
