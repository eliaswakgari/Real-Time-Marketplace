import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/axios';

// Safe localStorage loader
const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart');
    const parsed = saved ? JSON.parse(saved) : null;

    // Ensure structure is always valid
    return {
      items: parsed?.items || [],
      total: parsed?.total || 0,
      itemCount: parsed?.itemCount || 0,
    };
  } catch {
    return { items: [], total: 0, itemCount: 0 };
  }
};

// Save to localStorage safely
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

// Sync cart with server
export const syncCartWithServer = createAsyncThunk(
  'cart/syncCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();

      const response = await api.post('/cart/sync', {
        items: state.cart.items,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to sync cart' });
    }
  }
);

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      
      const existing = state.items.find(item => item.productId === product.id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          productId: product.id,
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            images: product.images,
            sellerId: product.sellerId,
            quantity: product.quantity,
          },
          quantity,
          price: product.price,
        });
      }

      // Update totals
      state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
      state.total = state.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

      saveCartToStorage(state);
    },

    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;

      const item = state.items.find(i => i.productId === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.productId !== productId);
        } else {
          item.quantity = quantity;
        }

        state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
        state.total = state.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

        saveCartToStorage(state);
      }
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter(i => i.productId !== productId);

      state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
      state.total = state.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.total = 0;

      saveCartToStorage(state);
    },

    setCart: (state, action) => {
      const { items = [], total = 0, itemCount = 0 } = action.payload;

      state.items = items;
      state.total = total;
      state.itemCount = itemCount;

      saveCartToStorage(state);
    },
  },

  extraReducers: (builder) => {
    builder.addCase(syncCartWithServer.fulfilled, (state, action) => {
      if (action.payload?.cart) {
        state.items = action.payload.cart.items || [];
        state.total = action.payload.cart.total || 0;
        state.itemCount = action.payload.cart.itemCount || 0;

        saveCartToStorage(state);
      }
    });
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;
