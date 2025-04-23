import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import authService from './authService';
import { extractErrorMessage } from '../../utils';

// Get user from localstorage
// const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: null,  
  isLoading: false,
  error:null
};

//Login user
export const login = createAsyncThunk('auth/create-user', async (user, thunkAPI) => {
  try {
    return await authService.login(user);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err));
  }
});

//verify otp
export const verifyOtp = createAsyncThunk('auth/verify-otp', async (otp, thunkAPI) => {
  try {
    
    return await authService.VerifyOtp(otp);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err));
  }
});

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
      .addCase(login.rejected, (state,action) => {
        state.isLoading = false;
        state.error= action.payload
        state.user = null;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.user = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      } )
      .addCase(verifyOtp.rejected, (state,action) => {
        state.isLoading = false;
        state.error = action.payload; 
        state.user = null;
      })
  },
});

export default authSlice.reducer;
