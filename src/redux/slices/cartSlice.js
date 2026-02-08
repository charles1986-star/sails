import { createSlice } from '@reduxjs/toolkit';

const CART_KEY = 'sails_cart_v1';

const load = () => {
  try {
    const s = localStorage.getItem(CART_KEY);
    return s ? JSON.parse(s) : [];
  } catch (e) {
    return [];
  }
};

const save = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {}
};

const initialState = {
  items: load(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const item = action.payload;
      const idx = state.items.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        state.items[idx].quantity += item.quantity || 1;
      } else {
        state.items.unshift({ ...item, quantity: item.quantity || 1 });
      }
      save(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const idx = state.items.findIndex(i => i.id === id);
      if (idx !== -1) {
        state.items[idx].quantity = quantity;
        if (state.items[idx].quantity <= 0) state.items.splice(idx, 1);
      }
      save(state.items);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      save(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      save(state.items);
    }
  }
});

export const { addItem, updateQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
