import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from './userService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  users: [],
  allUsers: [], // populated by getAllUsersWithNoPagination() — no params
  addressedToUsers: [], // populated by getAllUsersWithNoPagination({ ...params }) — with params
  user: '',
  isLoading: false,
  error: null,
  filters: {
    name: '',
    role: '',
    is_approved: '',
  },
};

// get all signers with optional filters
export const getAllSigners = createAsyncThunk(
  'user/getAllSigners',
  async (data, thunkAPI) => {
    try {
      return await userService.getAllSigners(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// get next signers
export const getNextSigners = createAsyncThunk(
  'user/getNextSigners',
  async (data, thunkAPI) => {
    try {
      return await userService.getNextSigners(data.id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// get CEO signer
export const getCeoSigner = createAsyncThunk(
  'user/getCeoSigner',
  async (_, thunkAPI) => {
    try {
      return await userService.getCeoSigner();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// get DCEO signer
export const getDceoSigner = createAsyncThunk(
  'user/getDceoSigner',
  async (_, thunkAPI) => {
    try {
      return await userService.getDceoSigner();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// get next signers by department
export const getDepartmentNextSigners = createAsyncThunk(
  'user/getDepartmentNextSigners',
  async (data, thunkAPI) => {
    try {
      return await userService.getDepartmentNextSigners(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// GET /auth/user-list/?${queryParams} — paginated, used by admin user-management pages
// result → state.users
export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (data, thunkAPI) => {
    try {
      return await userService.getAllUsers(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// GET /auth/all-users/  (always this endpoint, with optional query params)
// • Called WITHOUT params → result stored in state.allUsers  (admin/department/section pages)
// • Called WITH params    → result stored in state.addressedToUsers  ("Address Invoice To" dropdowns)
export const getAllUsersWithNoPagination = createAsyncThunk(
  'user/getAllUsersWithNoPagination',
  async (data = {}, thunkAPI) => {
    try {
      return await userService.getAllUsersWithNoPagination(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// update user role
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data, thunkAPI) => {
    try {
      return await userService.updateUser(data.id, data.formData);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// update supplier profile
export const updateSupplier = createAsyncThunk(
  'user/updateSupplier',
  async (data, thunkAPI) => {
    try {
      return await userService.updateSupplier(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Helper: did the thunk receive any filter params?
const hasFilterParams = (arg) =>
  arg != null && typeof arg === 'object' && Object.keys(arg).length > 0;

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
      // ── getAllSigners ────────────────────────────────────────────────────
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

      // ── getNextSigners ───────────────────────────────────────────────────
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

      // ── getCeoSigner ─────────────────────────────────────────────────────
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

      // ── getDceoSigner ────────────────────────────────────────────────────
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

      // ── getDepartmentNextSigners ─────────────────────────────────────────
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

      // ── getAllUsers (paginated admin list) → state.users ─────────────────
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

      // ── getAllUsersWithNoPagination → /auth/all-users/?[params] ───────────
      // With params    → state.addressedToUsers  (Address Invoice To dropdowns)
      // Without params → state.allUsers          (admin / department / section pages)
      .addCase(getAllUsersWithNoPagination.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        if (hasFilterParams(action.meta.arg)) {
          state.addressedToUsers = [];
        } else {
          state.allUsers = [];
        }
      })
      .addCase(getAllUsersWithNoPagination.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (hasFilterParams(action.meta.arg)) {
          state.addressedToUsers = action.payload;
        } else {
          state.allUsers = action.payload;
        }
      })
      .addCase(getAllUsersWithNoPagination.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        if (hasFilterParams(action.meta.arg)) {
          state.addressedToUsers = [];
        } else {
          state.allUsers = [];
        }
      })

      // ── updateUser ───────────────────────────────────────────────────────
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
      })

      // ── updateSupplier ───────────────────────────────────────────────────
      .addCase(updateSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.user = '';
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = '';
      });
  },
});

export const { setFilters, clearFilters } = userSlice.actions;
export default userSlice.reducer;
