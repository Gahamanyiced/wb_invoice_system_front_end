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

//get all invoiceDashboards by department and year
export const getAllInvoiceDashboardByDepartmentAndYear = createAsyncThunk(
  'invoiceDashboard/getAllInvoiceDashboardByDepartmentAndYear',
  async (data, thunkAPI) => {
    try {
      return await dashboardService.getAllInvoiceByDepartmentAndYear(
        data.department,
        data.year
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get invoice owned by year
export const getInvoiceOwnedByYear = createAsyncThunk(
  'invoiceDashboard/getInvoiceOwnedByYear',
  async (data, thunkAPI) => {
    try {
      return await dashboardService.getInvoiceOwnedByYear(data.id, data.year);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get invoice to sign by year
export const getInvoiceToSignByYear = createAsyncThunk(
  'invoiceDashboard/getInvoiceToSignByYear',
  async (data, thunkAPI) => {
    try {
      return await dashboardService.getInvoiceToSignByYear(data.id, data.year);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
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
      .addCase(getAllInvoiceDashboardByDepartmentAndYear.fulfilled, (state, { payload }) => {
        state.invoiceDashboard = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getAllInvoiceDashboardByDepartmentAndYear.rejected, (state, { payload }) => {
        state.error = payload;
        state.isLoading = false;
        state.invoiceDashboard = '';
      })
      
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
      });
  },
});

export const { setDashboardIndex, setCardIndex } = invoiceDashboardSlice.actions;
export default invoiceDashboardSlice.reducer;