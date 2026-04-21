import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from './dashboardService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  invoiceDashboards: [],
  invoiceDashboard: '',
  isLoading: false,
  error: null,
  index: null,
  cardIndex: null,
  year: null,
};

// get all invoiceDashboards by department and year
export const getAllInvoiceDashboardByDepartmentAndYear = createAsyncThunk(
  'invoiceDashboard/getAllInvoiceDashboardByDepartmentAndYear',
  async (data, thunkAPI) => {
    try {
      return await dashboardService.getAllInvoiceByDepartmentAndYear(
        data.department,
        data.year,
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// get invoice owned by year
export const getInvoiceOwnedByYear = createAsyncThunk(
  'invoiceDashboard/getInvoiceOwnedByYear',
  async (data, thunkAPI) => {
    try {
      return await dashboardService.getInvoiceOwnedByYear(data.id, data.year);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// get invoice to sign by year
export const getInvoiceToSignByYear = createAsyncThunk(
  'invoiceDashboard/getInvoiceToSignByYear',
  async (data, thunkAPI) => {
    try {
      return await dashboardService.getInvoiceToSignByYear(data.id, data.year);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// get supplier invoice stats
export const getSupplierStats = createAsyncThunk(
  'invoiceDashboard/getSupplierStats',
  async (data, thunkAPI) => {
    try {
      return await dashboardService.getSupplierStats(data.year);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ── Staff Stats thunk ─────────────────────────────────────────────────────────
// Mirrors getSupplierStats but hits /invoice/staff-stats/
// dispatch(getStaffStats({ year: 2025 }))
export const getStaffStats = createAsyncThunk(
  'invoiceDashboard/getStaffStats',
  async (data, thunkAPI) => {
    try {
      return await dashboardService.getStaffStats(data.year);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

const invoiceDashboardSlice = createSlice({
  name: 'invoiceDashboard',
  initialState,
  reducers: {
    setDashboardIndex: (state, action) => {
      state.index = action.payload;
    },
    setCardIndex: (state, action) => {
      state.cardIndex = action.payload?.cardIndex;
      state.year = action.payload?.year;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllInvoiceDashboardByDepartmentAndYear
      .addCase(getAllInvoiceDashboardByDepartmentAndYear.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoiceDashboard = '';
      })
      .addCase(
        getAllInvoiceDashboardByDepartmentAndYear.fulfilled,
        (state, { payload }) => {
          state.invoiceDashboard = payload;
          state.isLoading = false;
          state.error = null;
        },
      )
      .addCase(
        getAllInvoiceDashboardByDepartmentAndYear.rejected,
        (state, { payload }) => {
          state.error = payload;
          state.isLoading = false;
          state.invoiceDashboard = '';
        },
      )

      // getInvoiceOwnedByYear
      .addCase(getInvoiceOwnedByYear.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoiceDashboard = '';
      })
      .addCase(getInvoiceOwnedByYear.fulfilled, (state, { payload }) => {
        state.invoiceDashboard = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getInvoiceOwnedByYear.rejected, (state, { payload }) => {
        state.error = payload;
        state.isLoading = false;
        state.invoiceDashboard = '';
      })

      // getInvoiceToSignByYear
      .addCase(getInvoiceToSignByYear.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoiceDashboard = '';
      })
      .addCase(getInvoiceToSignByYear.fulfilled, (state, { payload }) => {
        state.invoiceDashboard = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getInvoiceToSignByYear.rejected, (state, { payload }) => {
        state.error = payload;
        state.isLoading = false;
        state.invoiceDashboard = '';
      })

      // getSupplierStats
      .addCase(getSupplierStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoiceDashboard = '';
      })
      .addCase(getSupplierStats.fulfilled, (state, { payload }) => {
        state.invoiceDashboard = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getSupplierStats.rejected, (state, { payload }) => {
        state.error = payload;
        state.isLoading = false;
        state.invoiceDashboard = '';
      })

      // getStaffStats
      .addCase(getStaffStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoiceDashboard = '';
      })
      .addCase(getStaffStats.fulfilled, (state, { payload }) => {
        state.invoiceDashboard = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getStaffStats.rejected, (state, { payload }) => {
        state.error = payload;
        state.isLoading = false;
        state.invoiceDashboard = '';
      });
  },
});

export const { setDashboardIndex, setCardIndex } =
  invoiceDashboardSlice.actions;
export default invoiceDashboardSlice.reducer;
