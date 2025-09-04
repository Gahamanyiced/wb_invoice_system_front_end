import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import authService from './authService';
import { extractErrorMessage } from '../../utils';

// Get user from localstorage
// const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: null,
  isLoading: false,
  error: null,
};

//Login user
export const login = createAsyncThunk(
  'auth/create-user',
  async (user, thunkAPI) => {
    try {
      return await authService.login(user);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//External Login user
export const externalLogin = createAsyncThunk(
  'auth/external-login-user',
  async (user, thunkAPI) => {
    try {
      return await authService.externalLogin(user);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//Register user
export const register = createAsyncThunk(
  '/auth/supplier_register',
  async (user, thunkAPI) => {
    try {
      return await authService.register(user);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//verify otp
export const verifyOtp = createAsyncThunk(
  'auth/verify-otp',
  async (otp, thunkAPI) => {
    try {
      return await authService.VerifyOtp(otp);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//Logout user
export const logout = createAction('auth/logout', async () => {
  await authService.logout();
  return {};
});

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
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        // Don't clear user state while pending
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        // Store the entire response payload, which includes the user data
        state.user = action.payload.user || action.payload; // Handle both formats
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
      });
  },
});

export default authSlice.reducer;
