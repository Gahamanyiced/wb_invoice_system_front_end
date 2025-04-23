import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sectionService from './sectionService';
import { extractErrorMessage } from '../../utils';

const initialState = {
  sections: [],
  allSections: [],
  section: '',
  isLoading: false,
  error: null,
  filters: {
    name: '',
    lead_by: '',
    department: '',
  },
};

//get all sections
export const getAllSection = createAsyncThunk(
  'section/getAllSection',
  async (data, thunkAPI) => {
    try {
      return await sectionService.getAllSection(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all sections with no pagination
export const getAllSectionsWithNoPagination = createAsyncThunk(
  'section/getAllSectionsWithNoPagination',
  async (data, thunkAPI) => {
    try {
      return await sectionService.getAllSectionsWithNoPagination(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get all sections
export const getAllSectionByDepartmentId = createAsyncThunk(
  'section/getAllSectionByDepartmentId',
  async (id, thunkAPI) => {
    try {
      return await sectionService.getAllSectionByDepartmentId(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//add section
export const addSection = createAsyncThunk(
  'section/addSection',
  async (data, thunkAPI) => {
    try {
      return await sectionService.addSection(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//update section
export const updateSection = createAsyncThunk(
  'section/updateSection',
  async (data, thunkAPI) => {
    try {
      return await sectionService.updateSection(data.id, data.formData);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get section by id
export const getSectionById = createAsyncThunk(
  'section/getSectionById',
  async (id, thunkAPI) => {
    try {
      return await sectionService.getSectionById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//delete section
export const deleteSection = createAsyncThunk(
  'section/deleteSection',
  async (id, thunkAPI) => {
    try {
      return await sectionService.deleteSection(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

//get section from erp
export const getSectionFromErp = createAsyncThunk(
  'section/getSectionFromErp',
  async (_, thunkAPI) => {
    try {
      return await sectionService.getSectionFromErp();
    } catch (err) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        name: '',
        lead_by: '',
        department: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllSection
      .addCase(getAllSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.sections = [];
      })
      .addCase(getAllSection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.sections = action.payload;
      })
      .addCase(getAllSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.sections = [];
      })
      
      // getAllSectionsWithNoPagination
      .addCase(getAllSectionsWithNoPagination.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.allSections = [];
      })
      .addCase(getAllSectionsWithNoPagination.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.allSections = action.payload;
      })
      .addCase(getAllSectionsWithNoPagination.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.allSections = [];
      })
      
      // getAllSectionByDepartmentId
      .addCase(getAllSectionByDepartmentId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.sections = [];
      })
      .addCase(getAllSectionByDepartmentId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.sections = action.payload;
      })
      .addCase(getAllSectionByDepartmentId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.sections = [];
      })
      
      // addSection
      .addCase(addSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addSection.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateSection
      .addCase(updateSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSection.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // getSectionById
      .addCase(getSectionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.section = '';
      })
      .addCase(getSectionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.section = action.payload;
      })
      .addCase(getSectionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.section = '';
      })
      
      // deleteSection
      .addCase(deleteSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.section = '';
      })
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.section = action.payload;
      })
      .addCase(deleteSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.section = '';
      })
      
      // getSectionFromErp
      .addCase(getSectionFromErp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.allSections = [];
      })
      .addCase(getSectionFromErp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.allSections = action.payload;
      })
      .addCase(getSectionFromErp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.allSections = [];
      });
  },
});

export const { setFilters, clearFilters } = sectionSlice.actions;
export default sectionSlice.reducer;