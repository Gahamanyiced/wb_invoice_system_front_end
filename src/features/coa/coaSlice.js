import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import coaService from './coaService';

const extractErrorMessage = (err) =>
  err?.response?.data?.detail ||
  err?.response?.data?.message ||
  err?.message ||
  'An error occurred';

// ==================== Suppliers ====================
export const getAllSuppliers = createAsyncThunk(
  'coa/getAllSuppliers',
  async (params, thunkAPI) => {
    try {
      return await coaService.getAllSuppliers(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const createSupplier = createAsyncThunk(
  'coa/createSupplier',
  async (data, thunkAPI) => {
    try {
      return await coaService.createSupplier(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const updateSupplier = createAsyncThunk(
  'coa/updateSupplier',
  async ({ id, data }, thunkAPI) => {
    try {
      return await coaService.updateSupplier(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const deleteSupplier = createAsyncThunk(
  'coa/deleteSupplier',
  async (id, thunkAPI) => {
    try {
      return await coaService.deleteSupplier(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Cost Centers ====================
export const getAllCostCenters = createAsyncThunk(
  'coa/getAllCostCenters',
  async (params, thunkAPI) => {
    try {
      return await coaService.getAllCostCenters(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const createCostCenter = createAsyncThunk(
  'coa/createCostCenter',
  async (data, thunkAPI) => {
    try {
      return await coaService.createCostCenter(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const updateCostCenter = createAsyncThunk(
  'coa/updateCostCenter',
  async ({ id, data }, thunkAPI) => {
    try {
      return await coaService.updateCostCenter(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const deleteCostCenter = createAsyncThunk(
  'coa/deleteCostCenter',
  async (id, thunkAPI) => {
    try {
      return await coaService.deleteCostCenter(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== GL Accounts ====================
export const getAllGLAccounts = createAsyncThunk(
  'coa/getAllGLAccounts',
  async (params, thunkAPI) => {
    try {
      return await coaService.getAllGLAccounts(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const createGLAccount = createAsyncThunk(
  'coa/createGLAccount',
  async (data, thunkAPI) => {
    try {
      return await coaService.createGLAccount(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const updateGLAccount = createAsyncThunk(
  'coa/updateGLAccount',
  async ({ id, data }, thunkAPI) => {
    try {
      return await coaService.updateGLAccount(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const deleteGLAccount = createAsyncThunk(
  'coa/deleteGLAccount',
  async (id, thunkAPI) => {
    try {
      return await coaService.deleteGLAccount(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Locations ====================
export const getAllLocations = createAsyncThunk(
  'coa/getAllLocations',
  async (params, thunkAPI) => {
    try {
      return await coaService.getAllLocations(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const createLocation = createAsyncThunk(
  'coa/createLocation',
  async (data, thunkAPI) => {
    try {
      return await coaService.createLocation(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const updateLocation = createAsyncThunk(
  'coa/updateLocation',
  async ({ id, data }, thunkAPI) => {
    try {
      return await coaService.updateLocation(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const deleteLocation = createAsyncThunk(
  'coa/deleteLocation',
  async (id, thunkAPI) => {
    try {
      return await coaService.deleteLocation(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Aircraft Types ====================
export const getAllAircraftTypes = createAsyncThunk(
  'coa/getAllAircraftTypes',
  async (params, thunkAPI) => {
    try {
      return await coaService.getAllAircraftTypes(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const createAircraftType = createAsyncThunk(
  'coa/createAircraftType',
  async (data, thunkAPI) => {
    try {
      return await coaService.createAircraftType(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const updateAircraftType = createAsyncThunk(
  'coa/updateAircraftType',
  async ({ id, data }, thunkAPI) => {
    try {
      return await coaService.updateAircraftType(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const deleteAircraftType = createAsyncThunk(
  'coa/deleteAircraftType',
  async (id, thunkAPI) => {
    try {
      return await coaService.deleteAircraftType(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Routes ====================
export const getAllRoutes = createAsyncThunk(
  'coa/getAllRoutes',
  async (params, thunkAPI) => {
    try {
      return await coaService.getAllRoutes(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const createRoute = createAsyncThunk(
  'coa/createRoute',
  async (data, thunkAPI) => {
    try {
      return await coaService.createRoute(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const updateRoute = createAsyncThunk(
  'coa/updateRoute',
  async ({ id, data }, thunkAPI) => {
    try {
      return await coaService.updateRoute(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);
export const deleteRoute = createAsyncThunk(
  'coa/deleteRoute',
  async (id, thunkAPI) => {
    try {
      return await coaService.deleteRoute(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  },
);

// ==================== Slice ====================
const initialState = {
  suppliers: null,
  costCenters: null,
  glAccounts: null,
  locations: null,
  aircraftTypes: null,
  routes: null,
  isLoading: false,
  error: null,
};

const buildCases = (builder, thunks, stateKey) => {
  const { getAll, create, update, del } = thunks;

  builder
    .addCase(getAll.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(getAll.fulfilled, (state, action) => {
      state.isLoading = false;
      state[stateKey] = action.payload;
    })
    .addCase(getAll.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase(create.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(create.fulfilled, (state) => {
      state.isLoading = false;
    })
    .addCase(create.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase(update.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(update.fulfilled, (state) => {
      state.isLoading = false;
    })
    .addCase(update.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase(del.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(del.fulfilled, (state) => {
      state.isLoading = false;
    })
    .addCase(del.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
};

const coaSlice = createSlice({
  name: 'coa',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    buildCases(
      builder,
      {
        getAll: getAllSuppliers,
        create: createSupplier,
        update: updateSupplier,
        del: deleteSupplier,
      },
      'suppliers',
    );
    buildCases(
      builder,
      {
        getAll: getAllCostCenters,
        create: createCostCenter,
        update: updateCostCenter,
        del: deleteCostCenter,
      },
      'costCenters',
    );
    buildCases(
      builder,
      {
        getAll: getAllGLAccounts,
        create: createGLAccount,
        update: updateGLAccount,
        del: deleteGLAccount,
      },
      'glAccounts',
    );
    buildCases(
      builder,
      {
        getAll: getAllLocations,
        create: createLocation,
        update: updateLocation,
        del: deleteLocation,
      },
      'locations',
    );
    buildCases(
      builder,
      {
        getAll: getAllAircraftTypes,
        create: createAircraftType,
        update: updateAircraftType,
        del: deleteAircraftType,
      },
      'aircraftTypes',
    );
    buildCases(
      builder,
      {
        getAll: getAllRoutes,
        create: createRoute,
        update: updateRoute,
        del: deleteRoute,
      },
      'routes',
    );
  },
});

export default coaSlice.reducer;
