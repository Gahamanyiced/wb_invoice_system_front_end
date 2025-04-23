import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from './userService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  users: [],
  allUsers: [],
  user: '',
  isLoading: false,
  error: null,
  filters: {
    name: '',
    role: '',
    is_approved: '',
  },
};

//get all signers
export const getAllSigners = createAsyncThunk(
  'user/getAllSigners',
  async (_, thunkAPI) => {
    try {
      return await userService.getAllSigners();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get next signers
export const getNextSigners = createAsyncThunk(
  'user/getNextSigners',
  async (data, thunkAPI) => {
    try {
      return await userService.getNextSigners(data.id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get Ceo signer
export const getCeoSigner = createAsyncThunk(
  'user/getCeoSigner',
  async (_, thunkAPI) => {
    try {
      return await userService.getCeoSigner();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get DCeo signer
export const getDceoSigner = createAsyncThunk(
  'user/getDceoSigner',
  async (_, thunkAPI) => {
    try {
      return await userService.getDceoSigner();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get next signers
export const getDepartmentNextSigners = createAsyncThunk(
  'user/getDepartmentNextSigners',
  async (data, thunkAPI) => {
    try {
      return await userService.getDepartmentNextSigners(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (data, thunkAPI) => {
    try {
      return await userService.getAllUsers(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const getAllUsersWithNoPagination = createAsyncThunk(
  'user/getAllUsersWithNoPagination',
  async (_, thunkAPI) => {
    try {
      return await userService.getAllUsersWithNoPagination();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//update user role
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data, thunkAPI) => {
    try {
      return await userService.updateUser(data.id, data.formData);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        name: '',
        role: '',
        is_approved: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllSigners
      .addCase(getAllSigners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.users = [];
      })
      .addCase(getAllSigners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.users = action.payload;
      })
      .addCase(getAllSigners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.users = [];
      })
      
      // getNextSigners
      .addCase(getNextSigners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.users = [];
      })
      .addCase(getNextSigners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.users = action.payload;
      })
      .addCase(getNextSigners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.users = [];
      })
      
      // getCeoSigner
      .addCase(getCeoSigner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.users = '';
      })
      .addCase(getCeoSigner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.users = action.payload;
      })
      .addCase(getCeoSigner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.users = '';
      })
      
      // getDceoSigner
      .addCase(getDceoSigner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.users = '';
      })
      .addCase(getDceoSigner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.users = action.payload;
      })
      .addCase(getDceoSigner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.users = '';
      })
      
      // getDepartmentNextSigners
      .addCase(getDepartmentNextSigners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.users = [];
      })
      .addCase(getDepartmentNextSigners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.users = action.payload;
      })
      .addCase(getDepartmentNextSigners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.users = [];
      })
      
      // getAllUsers
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.users = [];
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.users = [];
      })
      
      // getAllUsersWithNoPagination
      .addCase(getAllUsersWithNoPagination.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.allUsers = [];
      })
      .addCase(getAllUsersWithNoPagination.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.allUsers = action.payload;
      })
      .addCase(getAllUsersWithNoPagination.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.allUsers = [];
      })
      
      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.user = '';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = '';
      });
  },
});

export const { setFilters, clearFilters } = userSlice.actions;
export default userSlice.reducer;