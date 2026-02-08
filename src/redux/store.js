import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import shipReducer from './slices/shipSlice';
import applicationReducer from './slices/applicationSlice';
import transactionReducer from './slices/transactionSlice';
import categoriesReducer from './slices/categoriesSlice';
import portsReducer from './slices/portsSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ships: shipReducer,
    applications: applicationReducer,
    transactions: transactionReducer,
    categories: categoriesReducer,
    ports: portsReducer,
    cart: cartReducer,
  },
});

export default store;
