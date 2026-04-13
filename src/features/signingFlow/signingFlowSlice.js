import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import signingFlowService from './signingFlowService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  // Department / Section
  signingFlows: [],
  signingFlow: '',
  // Cost Center
  costCenterSigners: [],
  costCenterSigner: null,
  // Location
  locationSigners: [],
  locationSigner: null,
  // Supervisor
  supervisors: [],
  supervisor: null,
  // Shared
  isLoading: false,
  error: null,
  filters: {
    section: '',
    department: '',
  },
};

// ==================== Department / Section ====================

export const getAllSigningFlows = createAsyncThunk(
  'signingFlow/getAllSigningFlows',
  async (data, thunkAPI) => {
    try {
      return await signingFlowService.getAllSigningFlow(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const getAllSigningFlowByDepartment = createAsyncThunk(
  'signingFlow/getAllSigningFlowByDepartment',
  async (_, thunkAPI) => {
    try {
      return await signingFlowService.getAllSigningFlowByDepartment();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const addSigningFlow = createAsyncThunk(
  'signingFlow/addSigningFlow',
  async (data, thunkAPI) => {
    try {
      return await signingFlowService.addSigningFlow(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const editSigningFlow = createAsyncThunk(
  'signingFlow/editSigningFlow',
  async (data, thunkAPI) => {
    try {
      return await signingFlowService.editSigningFlow(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Cost Center Signers ====================

export const getAllCostCenterSigners = createAsyncThunk(
  'signingFlow/getAllCostCenterSigners',
  async (params, thunkAPI) => {
    try {
      return await signingFlowService.getAllCostCenterSigners(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const createCostCenterSigner = createAsyncThunk(
  'signingFlow/createCostCenterSigner',
  async (data, thunkAPI) => {
    try {
      return await signingFlowService.createCostCenterSigner(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const updateCostCenterSigner = createAsyncThunk(
  'signingFlow/updateCostCenterSigner',
  async ({ id, data }, thunkAPI) => {
    try {
      return await signingFlowService.updateCostCenterSigner(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const deleteCostCenterSigner = createAsyncThunk(
  'signingFlow/deleteCostCenterSigner',
  async ({ id, data }, thunkAPI) => {
    try {
      return await signingFlowService.deleteCostCenterSigner(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Location Signers ====================

export const getAllLocationSigners = createAsyncThunk(
  'signingFlow/getAllLocationSigners',
  async (params, thunkAPI) => {
    try {
      return await signingFlowService.getAllLocationSigners(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const createLocationSigner = createAsyncThunk(
  'signingFlow/createLocationSigner',
  async (data, thunkAPI) => {
    try {
      return await signingFlowService.createLocationSigner(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const updateLocationSigner = createAsyncThunk(
  'signingFlow/updateLocationSigner',
  async ({ id, data }, thunkAPI) => {
    try {
      return await signingFlowService.updateLocationSigner(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const deleteLocationSigner = createAsyncThunk(
  'signingFlow/deleteLocationSigner',
  async ({ id, data }, thunkAPI) => {
    try {
      return await signingFlowService.deleteLocationSigner(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Supervisor Signers ====================

export const getAllSupervisors = createAsyncThunk(
  'signingFlow/getAllSupervisors',
  async (_, thunkAPI) => {
    try {
      return await signingFlowService.getAllSupervisors();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const createSupervisor = createAsyncThunk(
  'signingFlow/createSupervisor',
  async (data, thunkAPI) => {
    try {
      return await signingFlowService.createSupervisor(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const updateSupervisor = createAsyncThunk(
  'signingFlow/updateSupervisor',
  async ({ id, data }, thunkAPI) => {
    try {
      return await signingFlowService.updateSupervisor(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const deleteSupervisor = createAsyncThunk(
  'signingFlow/deleteSupervisor',
  async (id, thunkAPI) => {
    try {
      return await signingFlowService.deleteSupervisor(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Slice ====================

export const signingFlowSlice = createSlice({
  name: 'signingFlow',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { section: '', department: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- getAllSigningFlows ----
      .addCase(getAllSigningFlows.pending, (state) => {
        state.isLoading = true;
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

      // ---- getAllSigningFlowByDepartment ----
      .addCase(getAllSigningFlowByDepartment.pending, (state) => {
        state.isLoading = true;
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

      // ---- addSigningFlow ----
      .addCase(addSigningFlow.pending, (state) => {
        state.isLoading = true;
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

      // ---- editSigningFlow ----
      .addCase(editSigningFlow.pending, (state) => {
        state.isLoading = true;
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
      })

      // ---- getAllCostCenterSigners ----
      .addCase(getAllCostCenterSigners.pending, (state) => {
        state.isLoading = true;
        state.costCenterSigners = [];
        state.error = null;
      })
      .addCase(getAllCostCenterSigners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.costCenterSigners = action.payload;
        state.error = null;
      })
      .addCase(getAllCostCenterSigners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.costCenterSigners = [];
      })

      // ---- createCostCenterSigner ----
      .addCase(createCostCenterSigner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCostCenterSigner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.costCenterSigner = action.payload;
        state.error = null;
      })
      .addCase(createCostCenterSigner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---- updateCostCenterSigner ----
      .addCase(updateCostCenterSigner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCostCenterSigner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.costCenterSigner = action.payload;
        state.error = null;
      })
      .addCase(updateCostCenterSigner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---- deleteCostCenterSigner ----
      .addCase(deleteCostCenterSigner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCostCenterSigner.fulfilled, (state) => {
        state.isLoading = false;
        state.costCenterSigner = null;
        state.error = null;
      })
      .addCase(deleteCostCenterSigner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---- getAllLocationSigners ----
      .addCase(getAllLocationSigners.pending, (state) => {
        state.isLoading = true;
        state.locationSigners = [];
        state.error = null;
      })
      .addCase(getAllLocationSigners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locationSigners = action.payload;
        state.error = null;
      })
      .addCase(getAllLocationSigners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.locationSigners = [];
      })

      // ---- createLocationSigner ----
      .addCase(createLocationSigner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLocationSigner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locationSigner = action.payload;
        state.error = null;
      })
      .addCase(createLocationSigner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---- updateLocationSigner ----
      .addCase(updateLocationSigner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLocationSigner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locationSigner = action.payload;
        state.error = null;
      })
      .addCase(updateLocationSigner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---- deleteLocationSigner ----
      .addCase(deleteLocationSigner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLocationSigner.fulfilled, (state) => {
        state.isLoading = false;
        state.locationSigner = null;
        state.error = null;
      })
      .addCase(deleteLocationSigner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---- getAllSupervisors ----
      .addCase(getAllSupervisors.pending, (state) => {
        state.isLoading = true;
        state.supervisors = [];
        state.error = null;
      })
      .addCase(getAllSupervisors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.supervisors = action.payload;
        state.error = null;
      })
      .addCase(getAllSupervisors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.supervisors = [];
      })

      // ---- createSupervisor ----
      .addCase(createSupervisor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSupervisor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.supervisor = action.payload;
        state.error = null;
      })
      .addCase(createSupervisor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---- updateSupervisor ----
      .addCase(updateSupervisor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupervisor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.supervisor = action.payload;
        state.error = null;
      })
      .addCase(updateSupervisor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---- deleteSupervisor ----
      .addCase(deleteSupervisor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSupervisor.fulfilled, (state) => {
        state.isLoading = false;
        state.supervisor = null;
        state.error = null;
      })
      .addCase(deleteSupervisor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = signingFlowSlice.actions;
export default signingFlowSlice.reducer;
