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

  // Petty Cash Expenses
  issuancePettyCashExpenses: [], // expenses scoped to a single petty cash issuance
  pettyCashExpense: null,
  expenseTrackingData: null,

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

// data: { id: number, comment: string }
export const deletePettyCash = createAsyncThunk(
  'pettyCash/deletePettyCash',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.deletePettyCash(data.id, {
        comment: data.comment,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

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

// ==================== Petty Cash Expenses ====================

// data: FormData with petty_cash_id, verifier_id, expenses (JSON string), expense_document_N
export const createPettyCashExpense = createAsyncThunk(
  'pettyCash/createPettyCashExpense',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.createPettyCashExpense(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// data: { id, formData }
export const updatePettyCashExpense = createAsyncThunk(
  'pettyCash/updatePettyCashExpense',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.updatePettyCashExpense(
        data.id,
        data.formData,
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// data: { id, comment }
export const deletePettyCashExpense = createAsyncThunk(
  'pettyCash/deletePettyCashExpense',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.deletePettyCashExpense(data.id, {
        comment: data.comment,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// List all expenses for a specific petty cash issuance
// pettyCashId: number | string  — plain ID, NOT an object
export const getIssuancePettyCashExpenses = createAsyncThunk(
  'pettyCash/getIssuancePettyCashExpenses',
  async (pettyCashId, thunkAPI) => {
    try {
      return await pettyCashService.getIssuancePettyCashExpenses(pettyCashId);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const trackPettyCashExpense = createAsyncThunk(
  'pettyCash/trackPettyCashExpense',
  async (id, thunkAPI) => {
    try {
      return await pettyCashService.trackPettyCashExpense(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// data: { id, data: { action: 'approve' | 'deny' | 'rollback', comment? } }
export const approvePettyCashExpense = createAsyncThunk(
  'pettyCash/approvePettyCashExpense',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.approvePettyCashExpense(data.id, data.data);
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
      state.filters = { status: '', holder_id: '', year: '', page: 1 };
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
    clearIssuancePettyCashExpenses: (state) => {
      state.issuancePettyCashExpenses = [];
      state.pettyCashExpense = null;
    },
    clearExpenseTrackingData: (state) => {
      state.expenseTrackingData = null;
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
      .addCase(deletePettyCash.fulfilled, (state) => {
        state.pettyCash = null;
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
      .addCase(deletePettyCashRequest.fulfilled, (state) => {
        state.pettyCashRequest = null;
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
      })

      // ==================== Create Petty Cash Expense ====================
      .addCase(createPettyCashExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPettyCashExpense.fulfilled, (state, action) => {
        state.pettyCashExpense = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createPettyCashExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Update Petty Cash Expense ====================
      .addCase(updatePettyCashExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePettyCashExpense.fulfilled, (state, action) => {
        state.pettyCashExpense = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updatePettyCashExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Delete Petty Cash Expense ====================
      .addCase(deletePettyCashExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePettyCashExpense.fulfilled, (state) => {
        state.pettyCashExpense = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deletePettyCashExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Get Issuance Petty Cash Expenses ====================
      .addCase(getIssuancePettyCashExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIssuancePettyCashExpenses.fulfilled, (state, action) => {
        state.issuancePettyCashExpenses = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getIssuancePettyCashExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Track Petty Cash Expense ====================
      .addCase(trackPettyCashExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackPettyCashExpense.fulfilled, (state, action) => {
        state.expenseTrackingData = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(trackPettyCashExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Approve Petty Cash Expense ====================
      .addCase(approvePettyCashExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approvePettyCashExpense.fulfilled, (state, action) => {
        state.pettyCashExpense = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(approvePettyCashExpense.rejected, (state, action) => {
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
  clearIssuancePettyCashExpenses,
  clearExpenseTrackingData,
} = pettyCashSlice.actions;

export default pettyCashSlice.reducer;
