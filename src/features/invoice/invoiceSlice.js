import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import invoiceService from './invoiceService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  invoices: [],
  invoice: '',
  isLoading: false,
  error: null,
  invoiceToSign: [],
  index: null,
  verifyInvoice: '',
  filters: {
    title: '',
    invoice_number: '',
    invoice_owner: '',
    created_date: '',
    status: '',
  },
};

//get all invoices by admin
export const getAllInvoice = createAsyncThunk(
  'invoice/getAllInvoice',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllInvoice(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all pending invoices by admin
export const getAllPendingInvoices = createAsyncThunk(
  'invoice/getAllPendingInvoices',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllPendingInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all approved invoices by admin
export const getAllApprovedInvoices = createAsyncThunk(
  'invoice/getAllApprovedInvoices',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllApprovedInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all denied invoices by admin
export const getAllDeniedInvoices = createAsyncThunk(
  'invoice/getAllDeniedInvoices',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllDeniedInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all rollbacked invoices by admin
export const getAllRollBackedInvoices = createAsyncThunk(
  'invoice/getAllRollbackedInvoices',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllRollBackedInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all processing invoices by admin
export const getAllProcessingInvoices = createAsyncThunk(
  'invoice/getAllProcessingInvoices',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllProcessingInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all forwarded invoices by admin
export const getAllForwardedInvoices = createAsyncThunk(
  'invoice/getAllForwardedInvoices',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllForwardedInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get invoice by user
export const getInvoiceByUser = createAsyncThunk(
  'invoice/getInvoiceByUser',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getInvoiceByUser(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get user pending invoice
export const getUserPendingInvoices = createAsyncThunk(
  'invoice/getPendingInvoiceByUser',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getUserPendingInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get user approved invoice
export const getUserApprovedInvoices = createAsyncThunk(
  'invoice/getApprovedInvoiceByUser',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getUserApprovedInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get user denied invoice
export const getUserDeniedInvoices = createAsyncThunk(
  'invoice/getDeniedInvoiceByUser',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getUserDeniedInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get user rollbacked invoice
export const getUserRollBackedInvoices = createAsyncThunk(
  'invoice/getRollbackInvoiceByUser',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getUserRollBackedInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get user processing invoice
export const getUserProcessingInvoices = createAsyncThunk(
  'invoice/getProcessingInvoiceByUser',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getUserProcessingInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get user forwarded invoice
export const getUserForwardedInvoices = createAsyncThunk(
  'invoice/getForwardedInvoiceByUser',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getUserForwardedInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//add invoice
export const addInvoice = createAsyncThunk(
  'invoice/addInvoice',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.addInvoice(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//update invoice
export const updateInvoice = createAsyncThunk(
  'invoice/updateInvoice',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.updateInvoice(data.id, data.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get invoice by id
export const getInvoiceById = createAsyncThunk(
  'invoice/getInvoiceById',
  async (id, thunkAPI) => {
    try {
      return await invoiceService.getInvoiceById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//delete invoice
export const deleteInvoice = createAsyncThunk(
  'invoice/deleteInvoice',
  async (id, thunkAPI) => {
    try {
      return await invoiceService.deleteInvoice(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//track invoice by id
export const trackInvoiceById = createAsyncThunk(
  'invoice/trackInvoiceById',
  async (id, thunkAPI) => {
    try {
      return await invoiceService.trackInvoiceById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//update invoice
export const signInvoice = createAsyncThunk(
  'invoice/signInvoice',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.signInvoiceById(data.id, data.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all own invoices assigned to a signer
export const getInvoiceToSign = createAsyncThunk(
  'invoice/getInvoiceToSign',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getInvoiceToSign(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all own invoices with to sign status
export const getAllInvoicesWithToSignStatus = createAsyncThunk(
  'invoice/getInvoicesWithToSignStatus',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllInvoicesWithToSignStatus(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all own invoices with signed status
export const getAllSignedInvoices = createAsyncThunk(
  'invoice/getInvoicesWithSignedStatus',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllSignedInvoices(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all own pending invoices to sign
export const getAllOwnPendingInvoicesToSign = createAsyncThunk(
  'invoice/getPendingInvoiceToSign',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllOwnPendingInvoicesToSign(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all own approved invoices to sign
export const getAllOwnApprovedInvoicesToSign = createAsyncThunk(
  'invoice/getApprovedInvoiceToSign',
  async (page, thunkAPI) => {
    try {
      return await invoiceService.getAllOwnApprovedInvoicesToSign(page);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all own Denied invoices by signer
export const getAllOwnDeniedInvoicesToSign = createAsyncThunk(
  'invoice/getDeniedInvoicesBySigner',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getAllOwnDeniedInvoicesToSign(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all own RollBacked invoices to sign
export const getAllOwnRollbackedInvoicesToSign = createAsyncThunk(
  'invoice/getRollbackedInvoiceToSign',
  async (page, thunkAPI) => {
    try {
      return await invoiceService.getAllOwnRollbackedInvoicesToSign(page);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all own Processing invoices to sign
export const getAllOwnProcessingInvoicesToSign = createAsyncThunk(
  'invoice/getProcessingInvoiceToSign',
  async (page, thunkAPI) => {
    try {
      return await invoiceService.getAllOwnProcessingInvoicesToSign(page);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

// comment invoice
export const commentInvoice = createAsyncThunk(
  'invoice/commentInvoice',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.commentInvoiceById(data.id, data.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

// deny invoice
export const denyInvoice = createAsyncThunk(
  'invoice/denyInvoice',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.denyInvoiceById(data.id, data.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

// deny invoice
export const rollbackInvoice = createAsyncThunk(
  'invoice/rollInvoice',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.rollbackInvoiceById(data.id, data.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

// get invoice Comments
export const invoiceComment = createAsyncThunk(
  'invoice/invoiceComment',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getInvoiceComments(data.id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//update index
export const updateIndex = createAsyncThunk(
  'invoice/updateIndex',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.updateIndex(data.index);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//verify signature
export const verifySignature = createAsyncThunk(
  'invoice/verifySignature',
  async (data, thunkAPI) => {
    try {
      return await invoiceService.verifySignature(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//verify and Track Invoice
export const verifyAndTrackInvoice = createAsyncThunk(
  'invoice/verifyAndTrackInvoice',
  async (invoiceId, thunkAPI) => {
    try {
      return await invoiceService.verifyAndTrackInvoice(invoiceId);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        title: '',
         invoice_number: '', 
        invoice_owner: '',
        created_date: '',
        status: '',
      };
    },
    setIndex: (state, action) => {
      state.index = action.payload;
    },
    clearInvoice: (state) => {
      state.invoice = null;
      state.error = null;
      state.verifyInvoice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all invoices
      .addCase(getAllInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all pending invoices
      .addCase(getAllPendingInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllPendingInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllPendingInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all approved invoices
      .addCase(getAllApprovedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllApprovedInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllApprovedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all denied invoices
      .addCase(getAllDeniedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllDeniedInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllDeniedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all rollbacked invoices
      .addCase(getAllRollBackedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllRollBackedInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllRollBackedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all processing invoices
      .addCase(getAllProcessingInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllProcessingInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllProcessingInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all forwarded invoices
      .addCase(getAllForwardedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllForwardedInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllForwardedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get invoice by user
      .addCase(getInvoiceByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getInvoiceByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getInvoiceByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get user pending invoices
      .addCase(getUserPendingInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getUserPendingInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getUserPendingInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get user approved invoices
      .addCase(getUserApprovedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getUserApprovedInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getUserApprovedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get user denied invoices
      .addCase(getUserDeniedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getUserDeniedInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getUserDeniedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get user rollbacked invoices
      .addCase(getUserRollBackedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getUserRollBackedInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getUserRollBackedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get user processing invoices
      .addCase(getUserProcessingInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getUserProcessingInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getUserProcessingInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get user forwarded invoices
      .addCase(getUserForwardedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getUserForwardedInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getUserForwardedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Add invoice
      .addCase(addInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoice = '';
      })
      .addCase(addInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoice = action.payload;
        state.error = null;
      })
      .addCase(addInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoice = '';
      })
      
      // Update invoice
      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoice = '';
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoice = action.payload;
        state.error = null;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoice = '';
      })
      
      // Get invoice by ID
      .addCase(getInvoiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoice = '';
      })
      .addCase(getInvoiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoice = action.payload;
        state.error = null;
      })
      .addCase(getInvoiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoice = '';
      })
      
      // Delete invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoce = '';
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoice = action.payload;
        state.error = null;
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoice = '';
      })
      
      // Track invoice by ID
      .addCase(trackInvoiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoice = '';
      })
      .addCase(trackInvoiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoice = action.payload;
        state.error = null;
      })
      .addCase(trackInvoiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoice = '';
      })
      
      // Sign invoice
      .addCase(signInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoice = '';
      })
      .addCase(signInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoice = action.payload;
        state.error = null;
      })
      .addCase(signInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoice = '';
      })
      
      // Get invoice to sign
      .addCase(getInvoiceToSign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getInvoiceToSign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getInvoiceToSign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all invoices with to sign status
      .addCase(getAllInvoicesWithToSignStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllInvoicesWithToSignStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllInvoicesWithToSignStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all signed invoices
      .addCase(getAllSignedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllSignedInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllSignedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all own pending invoices to sign
      .addCase(getAllOwnPendingInvoicesToSign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllOwnPendingInvoicesToSign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllOwnPendingInvoicesToSign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all own approved invoices to sign
      .addCase(getAllOwnApprovedInvoicesToSign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllOwnApprovedInvoicesToSign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllOwnApprovedInvoicesToSign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all own denied invoices to sign
      .addCase(getAllOwnDeniedInvoicesToSign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllOwnDeniedInvoicesToSign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllOwnDeniedInvoicesToSign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all own rollbacked invoices to sign
      .addCase(getAllOwnRollbackedInvoicesToSign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllOwnRollbackedInvoicesToSign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllOwnRollbackedInvoicesToSign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Get all own processing invoices to sign
      .addCase(getAllOwnProcessingInvoicesToSign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(getAllOwnProcessingInvoicesToSign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(getAllOwnProcessingInvoicesToSign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Comment invoice
      .addCase(commentInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoice = [];
      })
      .addCase(commentInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoice = action.payload;
        state.error = null;
      })
      .addCase(commentInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoice = [];
      })
      
      // Deny invoice
      .addCase(denyInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.denyInvoice = [];
      })
      .addCase(denyInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.denyInvoice = action.payload;
        state.error = null;
      })
      .addCase(denyInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.denyInvoice = [];
      })
      
      // Rollback invoice
      .addCase(rollbackInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.rollbackInvoice = [];
      })
      .addCase(rollbackInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rollbackInvoice = action.payload;
        state.error = null;
      })
      .addCase(rollbackInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.rollbackInvoice = [];
      })
      
      // Invoice comment
      .addCase(invoiceComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(invoiceComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(invoiceComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoices = [];
      })
      
      // Verify signature
      .addCase(verifySignature.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.invoice = '';
      })
      .addCase(verifySignature.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoice = action.payload;
        state.error = null;
      })
      .addCase(verifySignature.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.invoice = '';
      })
      
      // Verify and track invoice
      .addCase(verifyAndTrackInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.verifyInvoice = '';
      })
      .addCase(verifyAndTrackInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verifyInvoice = action.payload;
        state.error = null;
      })
      .addCase(verifyAndTrackInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.verifyInvoice = '';
      });
  },
});

export const { setFilters, clearFilters, setIndex, clearInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;