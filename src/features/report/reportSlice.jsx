import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import reportService from "./reportService";
import { extractErrorMessage } from "../../utils";

const initialState = {
    invoiceReports: [],
    invoiceReport: null,
    isLoading: false,
    error: null,
    
};

export const getInvoiceReport = createAsyncThunk(
    "report/getInvoiceReport",
    async (id, thunkAPI) => {
        try {
            return await reportService.getInvoiceReport(id);
        } catch (err) {
            return thunkAPI.rejectWithValue(extractErrorMessage(err));
        }
    }
);

export const getAllInvoiceReport = createAsyncThunk(
    "report/getAllInvoiceReport",
    async (thunkAPI) => {
        try {
            return await reportService.getAllInvoiceReport();
        } catch (err) {
            return thunkAPI.rejectWithValue(extractErrorMessage(err));
        }
    }
);

export const getInvoiceToSignReport = createAsyncThunk(
    "report/getInvoiceToSignReport",
    async (thunkAPI) => {
        try {
            return await reportService.getInvoiceToSignReport();
        } catch (err) {
            return thunkAPI.rejectWithValue(extractErrorMessage(err));
        }
    }
);

export const getUserOwnedInvoiceReport = createAsyncThunk(
    "report/getUserOwnedInvoiceReport",
    async (thunkAPI) => {
        try {
            return await reportService.getUserOwnedInvoiceReport();
        } catch (err) {
            return thunkAPI.rejectWithValue(extractErrorMessage(err));
        }
    }
);

const reportSlice = createSlice({
    name: "report",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getInvoiceReport cases
            .addCase(getInvoiceReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.invoiceReport = null;
            })
            .addCase(getInvoiceReport.fulfilled, (state, action) => {
                state.invoiceReport = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(getInvoiceReport.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
                state.invoiceReport = null;
            })
            
            // getAllInvoiceReport cases
            .addCase(getAllInvoiceReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.invoiceReport = null;
            })
            .addCase(getAllInvoiceReport.fulfilled, (state, action) => {
                state.invoiceReport = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(getAllInvoiceReport.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
                state.invoiceReport = null;
            })
            
            // getInvoiceToSignReport cases
            .addCase(getInvoiceToSignReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.invoiceReport = null;
            })
            .addCase(getInvoiceToSignReport.fulfilled, (state, action) => {
                state.invoiceReport = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(getInvoiceToSignReport.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
                state.invoiceReport = null;
            })
            
            // getUserOwnedInvoiceReport cases
            .addCase(getUserOwnedInvoiceReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.invoiceReport = null;
            })
            .addCase(getUserOwnedInvoiceReport.fulfilled, (state, action) => {
                state.invoiceReport = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(getUserOwnedInvoiceReport.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
                state.invoiceReport = null;
            });
    },
});

export default reportSlice.reducer;