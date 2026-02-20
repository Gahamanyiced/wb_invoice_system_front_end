import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import authService from './authService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  user: null,
  isLoading: false,
  error: null,
};

// Login user
export const login = createAsyncThunk(
  'auth/create-user',
  async (user, thunkAPI) => {
    try {
      return await authService.login(user);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// External Login user
export const externalLogin = createAsyncThunk(
  'auth/external-login-user',
  async (user, thunkAPI) => {
    try {
      return await authService.externalLogin(user);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Register user
export const register = createAsyncThunk(
  '/auth/supplier_register',
  async (user, thunkAPI) => {
    try {
      return await authService.register(user);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Verify OTP
export const verifyOtp = createAsyncThunk(
  'auth/verify-otp',
  async (otp, thunkAPI) => {
    try {
      return await authService.VerifyOtp(otp);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Logout user
export const logout = createAction('auth/logout', async () => {
  await authService.logout();
  return {};
});

// Request supplier password reset (sends email with reset link)
export const supplierPasswordReset = createAsyncThunk(
  'auth/supplier-password-reset',
  async (data, thunkAPI) => {
    try {
      return await authService.supplierPasswordReset(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Confirm supplier password reset (submits token + new password)
export const supplierPasswordResetConfirm = createAsyncThunk(
  'auth/supplier-password-reset-confirm',
  async (data, thunkAPI) => {
    try {
      return await authService.supplierPasswordResetConfirm(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const authSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== Login ====================
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.user = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
      })

      // ==================== External Login ====================
      .addCase(externalLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.user = null;
      })
      .addCase(externalLogin.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(externalLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
      })

      // ==================== Register ====================
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.user = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
      })

      // ==================== Verify OTP ====================
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.user = action.payload.user || action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
      })

      // ==================== Supplier Password Reset ====================
      .addCase(supplierPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(supplierPasswordReset.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(supplierPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Supplier Password Reset Confirm ====================
      .addCase(supplierPasswordResetConfirm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(supplierPasswordResetConfirm.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(supplierPasswordResetConfirm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
