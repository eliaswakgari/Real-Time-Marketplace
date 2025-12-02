import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/axios';

// ---- Async thunks ----
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message || 'Login failed' });
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/signup', userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message || 'Signup failed' });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Logout failed' });
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to get user' });
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/refresh-token');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Refresh token failed' });
    }
  }
);

// ---- initial state ----
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: null,
};

// ---- slice ----
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    clearSuccessMessage(state) { state.successMessage = null; },
    setSuccessMessage(state, action) { state.successMessage = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user || null;
        state.isAuthenticated = !!action.payload.user;
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
        state.isAuthenticated = false;
      })

      // signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload?.message || 'Signup successful';
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Signup failed';
      })

      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })

      // get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload?.user || null;
        state.isAuthenticated = !!action.payload?.user;
        state.loading = false;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = 'Failed to get user';
      })

      // refresh token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload?.user || state.user;
        state.isAuthenticated = !!state.user;
        state.loading = false;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || 'Refresh token failed';
      });
  },
});

export const { clearError, clearSuccessMessage, setSuccessMessage } = authSlice.actions;
export default authSlice.reducer;
