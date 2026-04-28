import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pettyCashService from './pettyCashService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  pettyCashList: [],
  pettyCash: null,
  pettyCashRequests: [],
  pettyCashRequest: null,
  trackingData: null,
  issuancePettyCashExpenses: [],
  pettyCashExpense: null,
  expenseTrackingData: null,
  issueComments: [],
  pettyCashReplenishRequest: null,
  replenishRequestTrackingData: null,
  issuanceRequests: [],
  pettyCashLedger: null,
  pettyCashReport: null,
  pettyCashDashboard: null,
  isLoading: false,
  isExporting: false,
  error: null,
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

// data: { id: number | string, formData: FormData }
// FormData fields: notes, issue_date, supporting_document
export const replenishPettyCash = createAsyncThunk(
  'pettyCash/replenishPettyCash',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.replenishPettyCash(data.id, data.formData);
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
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.deletePettyCashRequest(data.id, {
        comment: data.comment,
      });
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

// ==================== Petty Cash Expenses ====================

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

// ==================== Bulk Action Expenses ====================

export const bulkActionPettyCashExpenses = createAsyncThunk(
  'pettyCash/bulkActionPettyCashExpenses',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.bulkActionPettyCashExpenses(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Petty Cash Replenishment Requests ====================

export const createPettyCashReplenishRequest = createAsyncThunk(
  'pettyCash/createPettyCashReplenishRequest',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.createPettyCashRequest(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const updatePettyCashReplenishRequest = createAsyncThunk(
  'pettyCash/updatePettyCashReplenishRequest',
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

export const deletePettyCashReplenishRequest = createAsyncThunk(
  'pettyCash/deletePettyCashReplenishRequest',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.deletePettyCashRequest(data.id, {
        comment: data.comment,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const trackPettyCashReplenishRequest = createAsyncThunk(
  'pettyCash/trackPettyCashReplenishRequest',
  async (id, thunkAPI) => {
    try {
      return await pettyCashService.trackPettyCashRequest(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const approvePettyCashReplenishRequest = createAsyncThunk(
  'pettyCash/approvePettyCashReplenishRequest',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.approvePettyCashRequest(data.id, data.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const approvePettyCashRequest = createAsyncThunk(
  'pettyCash/approvePettyCashRequest',
  async (data, thunkAPI) => {
    try {
      return await pettyCashService.approvePettyCashRequest(data.id, data.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const getPettyCashIssueComments = createAsyncThunk(
  'pettyCash/getPettyCashIssueComments',
  async (id, thunkAPI) => {
    try {
      return await pettyCashService.getPettyCashIssueComments(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Export Approved Expenses ====================

export const exportApprovedExpenses = createAsyncThunk(
  'pettyCash/exportApprovedExpenses',
  async (id, thunkAPI) => {
    try {
      const response = await pettyCashService.exportApprovedExpenses(id);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Issuance-scoped Requests ====================

export const getPettyCashIssuanceRequests = createAsyncThunk(
  'pettyCash/getPettyCashIssuanceRequests',
  async ({ id, params = {} }, thunkAPI) => {
    try {
      return await pettyCashService.getPettyCashIssuanceRequests(id, params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Petty Cash Ledger ====================

export const getPettyCashLedger = createAsyncThunk(
  'pettyCash/getPettyCashLedger',
  async (id, thunkAPI) => {
    try {
      return await pettyCashService.getPettyCashLedger(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Petty Cash Report ====================

export const getPettyCashReport = createAsyncThunk(
  'pettyCash/getPettyCashReport',
  async (params, thunkAPI) => {
    try {
      return await pettyCashService.getPettyCashReport(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Petty Cash Dashboard ====================
// Accepts optional params: { year, custodian_id, date_from, date_to }

export const getPettyCashDashboard = createAsyncThunk(
  'pettyCash/getPettyCashDashboard',
  async (params = {}, thunkAPI) => {
    try {
      return await pettyCashService.getPettyCashDashboard(params);
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
    clearIssuanceRequests: (state) => {
      state.issuanceRequests = [];
    },
    clearPettyCashLedger: (state) => {
      state.pettyCashLedger = null;
    },
    clearPettyCashReport: (state) => {
      state.pettyCashReport = null;
    },
    clearPettyCashDashboard: (state) => {
      state.pettyCashDashboard = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== Issuance ====================
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

      .addCase(replenishPettyCash.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(replenishPettyCash.fulfilled, (state, action) => {
        state.pettyCash = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(replenishPettyCash.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Acknowledgment ====================
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

      // ==================== Requests ====================
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

      // ==================== Expenses ====================
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
      })

      // ==================== Bulk Action Expenses ====================
      .addCase(bulkActionPettyCashExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkActionPettyCashExpenses.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(bulkActionPettyCashExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Replenishment Requests ====================
      .addCase(createPettyCashReplenishRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPettyCashReplenishRequest.fulfilled, (state, action) => {
        state.pettyCashReplenishRequest = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createPettyCashReplenishRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updatePettyCashReplenishRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePettyCashReplenishRequest.fulfilled, (state, action) => {
        state.pettyCashReplenishRequest = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updatePettyCashReplenishRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deletePettyCashReplenishRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePettyCashReplenishRequest.fulfilled, (state) => {
        state.pettyCashReplenishRequest = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deletePettyCashReplenishRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(trackPettyCashReplenishRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackPettyCashReplenishRequest.fulfilled, (state, action) => {
        state.replenishRequestTrackingData = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(trackPettyCashReplenishRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(approvePettyCashReplenishRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approvePettyCashReplenishRequest.fulfilled, (state, action) => {
        state.pettyCashReplenishRequest = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(approvePettyCashReplenishRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(approvePettyCashRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approvePettyCashRequest.fulfilled, (state, action) => {
        state.pettyCashReplenishRequest = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(approvePettyCashRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Issue Comments ====================
      .addCase(getPettyCashIssueComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPettyCashIssueComments.fulfilled, (state, action) => {
        state.issueComments = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getPettyCashIssueComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Export ====================
      .addCase(exportApprovedExpenses.pending, (state) => {
        state.isExporting = true;
        state.error = null;
      })
      .addCase(exportApprovedExpenses.fulfilled, (state) => {
        state.isExporting = false;
        state.error = null;
      })
      .addCase(exportApprovedExpenses.rejected, (state, action) => {
        state.isExporting = false;
        state.error = action.payload;
      })

      // ==================== Issuance-scoped Requests ====================
      .addCase(getPettyCashIssuanceRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPettyCashIssuanceRequests.fulfilled, (state, action) => {
        state.issuanceRequests = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getPettyCashIssuanceRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Ledger ====================
      .addCase(getPettyCashLedger.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPettyCashLedger.fulfilled, (state, action) => {
        state.pettyCashLedger = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getPettyCashLedger.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Report ====================
      .addCase(getPettyCashReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPettyCashReport.fulfilled, (state, action) => {
        state.pettyCashReport = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getPettyCashReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Dashboard ====================
      .addCase(getPettyCashDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPettyCashDashboard.fulfilled, (state, action) => {
        state.pettyCashDashboard = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getPettyCashDashboard.rejected, (state, action) => {
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
  clearIssuanceRequests,
  clearPettyCashLedger,
  clearPettyCashReport,
  clearPettyCashDashboard,
} = pettyCashSlice.actions;

export default pettyCashSlice.reducer;
