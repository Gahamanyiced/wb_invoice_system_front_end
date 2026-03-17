import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import delegationService from './delegationService';

const extractErrorMessage = (err) =>
  err?.response?.data?.detail ||
  err?.response?.data?.message ||
  err?.message ||
  'An error occurred';

// ==================== Thunks ====================

export const getAllDelegations = createAsyncThunk(
  'delegation/getAllDelegations',
  async (params, thunkAPI) => {
    try {
      return await delegationService.getAllDelegations(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const createDelegation = createAsyncThunk(
  'delegation/createDelegation',
  async (data, thunkAPI) => {
    try {
      return await delegationService.createDelegation(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const updateDelegation = createAsyncThunk(
  'delegation/updateDelegation',
  async ({ id, data }, thunkAPI) => {
    try {
      return await delegationService.updateDelegation(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const deleteDelegation = createAsyncThunk(
  'delegation/deleteDelegation',
  async (id, thunkAPI) => {
    try {
      return await delegationService.deleteDelegation(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

// ==================== Slice ====================

const initialState = {
  delegations: null,   // { count, results: [] } or null before first fetch
  isLoading: false,
  error: null,
};

const delegationSlice = createSlice({
  name: 'delegation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllDelegations
      .addCase(getAllDelegations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllDelegations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.delegations = action.payload;
        state.error = null;
      })
      .addCase(getAllDelegations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // createDelegation
      .addCase(createDelegation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDelegation.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createDelegation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // updateDelegation
      .addCase(updateDelegation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDelegation.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateDelegation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // deleteDelegation
      .addCase(deleteDelegation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDelegation.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteDelegation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default delegationSlice.reducer;