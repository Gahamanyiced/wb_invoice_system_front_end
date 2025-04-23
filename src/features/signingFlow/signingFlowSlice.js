import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import signingFlowService from './signingFlowService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  signingFlows: [],
  signingFlow: '',
  isLoading: false,
  error: null,
  filters: {
    section: '',
    department: '',
  },
};

//get all signing flows
export const getAllSigningFlows = createAsyncThunk(
  'signingFlow/getAllSigningFlows',
  async (data, thunkAPI) => {
    try {
      return await signingFlowService.getAllSigningFlow(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all signing flows by department
export const getAllSigningFlowByDepartment = createAsyncThunk(
  'signingFlow/getAllSigningFlowByDepartment',
  async (_, thunkAPI) => {
    try {
      return await signingFlowService.getAllSigningFlowByDepartment();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//add signing flow
export const addSigningFlow = createAsyncThunk(
  'signingFlow/addSigningFlow',
  async (data, thunkAPI) => {
    try {
      return await signingFlowService.addSigningFlow(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

// update/delete signing flow
export const editSigningFlow = createAsyncThunk(
  'signingFlow/editSigningFlow',
  async (data, thunkAPI) => {
    try {
      return await signingFlowService.editSigningFlow(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const signingFlowSlice = createSlice({
  name: 'signingFlow',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        section: '',
        department: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSigningFlows.pending, (state) => {
        state.isLoading = true;
        state.signingFlows = [];
        state.error = null;
      })
      .addCase(getAllSigningFlows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signingFlows = action.payload;
        state.error = null;
      })
      .addCase(getAllSigningFlows.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.signingFlows = [];
      })
      .addCase(getAllSigningFlowByDepartment.pending, (state) => {
        state.isLoading = true;
        state.signingFlows = [];
        state.error = null;
      })
      .addCase(getAllSigningFlowByDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signingFlows = action.payload;
        state.error = null;
      })
      .addCase(getAllSigningFlowByDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.signingFlows = [];
      })
      .addCase(addSigningFlow.pending, (state) => {
        state.isLoading = true;
        state.signingFlow = '';
        state.error = null;
      })
      .addCase(addSigningFlow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signingFlow = action.payload;
        state.error = null;
      })
      .addCase(addSigningFlow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.signingFlow = '';
      })
      .addCase(editSigningFlow.pending, (state) => {
        state.isLoading = true;
        state.signingFlow = '';
        state.error = null;
      })
      .addCase(editSigningFlow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signingFlow = action.payload;
        state.error = null;
      })
      .addCase(editSigningFlow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.signingFlow = '';
      });
  },
});

export const { setFilters, clearFilters } = signingFlowSlice.actions;
export default signingFlowSlice.reducer;
