import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import productReducer from '../store/slices/productSlice';
import cartReducer from '../store/slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    products: productReducer,
    cart: cartReducer,
  },
});

export default store;