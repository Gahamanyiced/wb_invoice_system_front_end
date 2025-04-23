import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import departmentService from './departmentService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  departments: [],
  allDepartments: [],
  department: '',
  isLoading: false,
  error: null,
  isHeadDepartment: false,
  filters: {
    name: '',
    lead_by: '',
  },
};

//get all departments
export const getAllDepartment = createAsyncThunk(
  'department/getAllDepartment',
  async (data, thunkAPI) => {
    try {
      return await departmentService.getAllDepartment(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all department from erp
export const getDepartmentByErp = createAsyncThunk(
  'department/getDepartmentByErp',
  async (_, thunkAPI) => {
    try {
      return await departmentService.getDepartmentByErp();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//add department
export const addDepartment = createAsyncThunk(
  'department/addDepartment',
  async (data, thunkAPI) => {
    try {
      return await departmentService.addDepartment(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//update department
export const updateDepartment = createAsyncThunk(
  'department/updateDepartment',
  async (data, thunkAPI) => {
    try {
      return await departmentService.updateDepartment(data.id, data.formData);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get department by id
export const getDepartmentById = createAsyncThunk(
  'department/getDepartmentById',
  async (id, thunkAPI) => {
    try {
      return await departmentService.getDepartmentById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//delete department
export const deleteDepartment = createAsyncThunk(
  'department/deleteDepartment',
  async (id, thunkAPI) => {
    try {
      return await departmentService.deleteDepartment(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//check head department
export const checkHeadDepartment = createAsyncThunk(
  'department/checkHeadDepartment',
  async (_, thunkAPI) => {
    try {
      return await departmentService.checkHeadDepartment();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        name: '',
        lead_by: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllDepartment.fulfilled, (state, action) => {
        state.departments = action.payload;
        state.isLoading = false;
      })
      .addCase(getAllDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getDepartmentByErp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.allDepartments = [];
      })
      .addCase(getDepartmentByErp.fulfilled, (state, action) => {
        state.allDepartments = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getDepartmentByErp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.allDepartments = [];
      })
      .addCase(addDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.department = action.payload;
        state.isLoading = false;
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.department = '';
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.department = action.payload;
        state.isLoading = false;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.department = '';
      })
      .addCase(getDepartmentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.department = action.payload;
        state.isLoading = false;
      })
      .addCase(getDepartmentById.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.department = '';
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.department = action.payload;
        state.isLoading = false;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.department = '';
      })
      .addCase(checkHeadDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isHeadDepartment = false;
      })
      .addCase(checkHeadDepartment.fulfilled, (state, action) => {
        state.isHeadDepartment = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkHeadDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isHeadDepartment = false;
      });
  },
});

export const { setFilters, clearFilters} = departmentSlice.actions;
export default departmentSlice.reducer;
