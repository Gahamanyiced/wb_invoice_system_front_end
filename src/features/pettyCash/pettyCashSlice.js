import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pettyCashService from './pettyCashService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  // Petty Cash Issuance
  pettyCashList: [],
  pettyCash: null,

  // Petty Cash Requests
  pettyCashRequests: [],
  pettyCashRequest: null,
  trackingData: null,

  // Loading and Error states
  isLoading: false,
  error: null,

  // Filters
  filters: {
    status: '',
    holder_id: '',
    year: '',
    page: 1,
  },
};

// ==================== Petty Cash Issuance ====================

// Issue Petty Cash
export const issuePettyCash = createAsyncThunk(
  'pettyCash/issuePettyCash',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.issuePettyCash(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Get All Petty Cash
export const getAllPettyCash = createAsyncThunk(
  'pettyCash/getAllPettyCash',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.getAllPettyCash(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Get Petty Cash by ID
export const getPettyCashById = createAsyncThunk(
  'pettyCash/getPettyCashById',
  async (id, thunkAPI) => {
    try {
      return await pettyCashService.getPettyCashById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Update Petty Cash
export const updatePettyCash = createAsyncThunk(
  'pettyCash/updatePettyCash',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.updatePettyCash(data.id, data.formData);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Delete Petty Cash
export const deletePettyCash = createAsyncThunk(
  'pettyCash/deletePettyCash',
  async (id, thunkAPI) => {
    try {
      return await pettyCashService.deletePettyCash(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Rollback Petty Cash
export const rollbackPettyCash = createAsyncThunk(
  'pettyCash/rollbackPettyCash',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.rollbackPettyCash(data.id, data.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Petty Cash Acknowledgment ====================

// Acknowledge Petty Cash
export const acknowledgePettyCash = createAsyncThunk(
  'pettyCash/acknowledgePettyCash',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.acknowledgePettyCash(
        data.id,
        data.formData,
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Petty Cash Requests ====================

// Create Petty Cash Request
export const createPettyCashRequest = createAsyncThunk(
  'pettyCash/createPettyCashRequest',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.createPettyCashRequest(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Get All Petty Cash Requests
export const getAllPettyCashRequests = createAsyncThunk(
  'pettyCash/getAllPettyCashRequests',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.getAllPettyCashRequests(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Get Petty Cash Request by ID
export const getPettyCashRequestById = createAsyncThunk(
  'pettyCash/getPettyCashRequestById',
  async (id, thunkAPI) => {
    try {
      return await pettyCashService.getPettyCashRequestById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Update Petty Cash Request
export const updatePettyCashRequest = createAsyncThunk(
  'pettyCash/updatePettyCashRequest',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.updatePettyCashRequest(
        data.id,
        data.formData,
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Delete Petty Cash Request
export const deletePettyCashRequest = createAsyncThunk(
  'pettyCash/deletePettyCashRequest',
  async (id, thunkAPI) => {
    try {
      return await pettyCashService.deletePettyCashRequest(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// Track Petty Cash Request
export const trackPettyCashRequest = createAsyncThunk(
  'pettyCash/trackPettyCashRequest',
  async (id, thunkAPI) => {
    try {
      return await pettyCashService.trackPettyCashRequest(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Sign Request ====================

// Sign Petty Cash Request (for Forward, Deny, Rollback)
export const signPettyCashRequest = createAsyncThunk(
  'pettyCash/signPettyCashRequest',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.signPettyCashRequest(data.id, data.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Slice ====================

export const pettyCashSlice = createSlice({
  name: 'pettyCash',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        holder_id: '',
        year: '',
        page: 1,
      };
    },
    clearPettyCash: (state) => {
      state.pettyCash = null;
    },
    clearPettyCashRequest: (state) => {
      state.pettyCashRequest = null;
    },
    clearTrackingData: (state) => {
      state.trackingData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== Issue Petty Cash ====================
      .addCase(issuePettyCash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(issuePettyCash.fulfilled, (state, action) => {
        state.pettyCash = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(issuePettyCash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Get All Petty Cash ====================
      .addCase(getAllPettyCash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllPettyCash.fulfilled, (state, action) => {
        state.pettyCashList = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getAllPettyCash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Get Petty Cash by ID ====================
      .addCase(getPettyCashById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPettyCashById.fulfilled, (state, action) => {
        state.pettyCash = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getPettyCashById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Update Petty Cash ====================
      .addCase(updatePettyCash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePettyCash.fulfilled, (state, action) => {
        state.pettyCash = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updatePettyCash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Delete Petty Cash ====================
      .addCase(deletePettyCash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePettyCash.fulfilled, (state, action) => {
        state.pettyCash = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deletePettyCash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Rollback Petty Cash ====================
      .addCase(rollbackPettyCash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rollbackPettyCash.fulfilled, (state, action) => {
        state.pettyCash = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(rollbackPettyCash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Acknowledge Petty Cash ====================
      .addCase(acknowledgePettyCash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acknowledgePettyCash.fulfilled, (state, action) => {
        state.pettyCash = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(acknowledgePettyCash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Create Petty Cash Request ====================
      .addCase(createPettyCashRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPettyCashRequest.fulfilled, (state, action) => {
        state.pettyCashRequest = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createPettyCashRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Get All Petty Cash Requests ====================
      .addCase(getAllPettyCashRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllPettyCashRequests.fulfilled, (state, action) => {
        state.pettyCashRequests = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getAllPettyCashRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Get Petty Cash Request by ID ====================
      .addCase(getPettyCashRequestById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPettyCashRequestById.fulfilled, (state, action) => {
        state.pettyCashRequest = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getPettyCashRequestById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Update Petty Cash Request ====================
      .addCase(updatePettyCashRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePettyCashRequest.fulfilled, (state, action) => {
        state.pettyCashRequest = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updatePettyCashRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Delete Petty Cash Request ====================
      .addCase(deletePettyCashRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePettyCashRequest.fulfilled, (state, action) => {
        state.pettyCashRequest = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deletePettyCashRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Track Petty Cash Request ====================
      .addCase(trackPettyCashRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackPettyCashRequest.fulfilled, (state, action) => {
        state.trackingData = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(trackPettyCashRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Sign Petty Cash Request ====================
      .addCase(signPettyCashRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signPettyCashRequest.fulfilled, (state, action) => {
        state.pettyCashRequest = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signPettyCashRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearPettyCash,
  clearPettyCashRequest,
  clearTrackingData,
} = pettyCashSlice.actions;

export default pettyCashSlice.reducer;
