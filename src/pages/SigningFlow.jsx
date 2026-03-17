import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import RootLayout from '../layouts/RootLayout';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import ViewSigningFlowModal from '../components/ViewSigningFlowModal';
import DeleteSigningFlowDialog from '../components/DeleteSigningFlowDialog';
import UpdateSigningFlow from '../components/UpdateSigningFlow';
import FilterPanel from '../components/global/FilterPanel';
import CostCenterSigningFlow from '../components/CostCenterSigningFlow';
import LocationSigningFlow from '../components/LocationSigningFlow';

import {
  addSigningFlow,
  getAllSigningFlows,
  getAllSigningFlowByDepartment,
  setFilters,
} from '../features/signingFlow/signingFlowSlice';
import {
  getAllSectionsWithNoPagination,
  getAllSectionByDepartmentId,
} from '../features/section/sectionSlice';
import { getAllDepartment } from '../features/department/departmentSlice';
import { getAllSigners } from '../features/user/userSlice';

// ==================== Shared table styles ====================
const tableStyles = {
  header: {
    backgroundColor: '#00529B',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  addButton: {
    backgroundColor: '#00529B',
    color: '#fff',
    textTransform: 'none',
    '&:hover': { backgroundColor: '#003f7a' },
  },
  rowButton: {
    minWidth: 'unset',
    padding: '4px',
    color: '#00529B',
  },
};

// ---- Tab Panel wrapper ----
function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

// ==================== Add Signing Flow Dialog ====================
function AddDeptSigningFlowDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const loginUser = JSON.parse(localStorage.getItem('user'));

  const { departments } = useSelector((state) => state.department);
  const { sections } = useSelector((state) => state.section);
  const { isLoading } = useSelector((state) => state.signingFlow);

  const rawUsers = useSelector((s) => s.user.users);
  const signersList = Array.isArray(rawUsers)
    ? rawUsers
    : rawUsers?.results || [];

  const [department, setDepartment] = useState(null);
  const [section, setSection] = useState(null);
  const [rows, setRows] = useState([{ signer: null, order: 1 }]);

  // Build Autocomplete option arrays
  const departmentOptions = (departments?.results || []).map((d) => ({
    id: d.id,
    label: d.name,
  }));

  const sectionOptions = (Array.isArray(sections) ? sections : []).map((s) => ({
    id: s.id,
    label: s.name,
  }));

  const signerOptions = signersList.map((s) => ({
    id: s.id,
    label: `${s.firstname} ${s.lastname}`,
  }));

  // Reset on open
  useEffect(() => {
    if (open) {
      setDepartment(null);
      setSection(null);
      setRows([{ signer: null, order: 1 }]);
    }
  }, [open]);

  const handleDepartmentChange = (newValue) => {
    setDepartment(newValue);
    setSection(null);
    if (newValue?.id) {
      dispatch(getAllSectionByDepartmentId(newValue.id));
    }
  };

  const addRow = () =>
    setRows((prev) => [...prev, { signer: null, order: prev.length + 1 }]);

  const removeRow = (i) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i, field, value) =>
    setRows((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });

  const handleSubmit = async () => {
    if (!department) {
      toast.error('Please select a Department');
      return;
    }
    if (!section) {
      toast.error('Please select a Section');
      return;
    }
    for (const r of rows) {
      if (!r.signer || !r.order) {
        toast.error('All signer rows must have a signer and level');
        return;
      }
    }

    const payload = {
      department: department.id,
      section: section.id,
      levels: rows.map((r) => ({
        level: Number(r.order),
        approver: r.signer.id,
      })),
    };

    try {
      await dispatch(addSigningFlow(payload)).unwrap();
      toast.success('Signing Flow added successfully');
      onClose();
      loginUser?.role === 'signer_admin'
        ? dispatch(getAllSigningFlowByDepartment())
        : dispatch(getAllSigningFlows());
    } catch (error) {
      toast.error(error || 'Failed to create signing flow');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: '#00529B',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Add Department / Section Signing Flow
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Department */}
          <Autocomplete
            options={departmentOptions}
            value={department}
            onChange={(_, newValue) => handleDepartmentChange(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Department"
                size="small"
                required
                placeholder="Search department..."
              />
            )}
            noOptionsText="No departments found"
          />

          {/* Section — disabled until department chosen */}
          <Autocomplete
            options={sectionOptions}
            value={section}
            onChange={(_, newValue) => setSection(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            disabled={!department}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Section"
                size="small"
                required
                placeholder={
                  department ? 'Search section...' : 'Select a department first'
                }
              />
            )}
            noOptionsText="No sections found for this department"
          />

          <Typography variant="subtitle2" color="text.secondary">
            Signers (in order)
          </Typography>

          {/* Dynamic signer rows */}
          {rows.map((row, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Autocomplete
                options={signerOptions}
                value={row.signer}
                onChange={(_, newValue) => updateRow(i, 'signer', newValue)}
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
                sx={{ flex: 2 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Signer"
                    size="small"
                    required
                    placeholder="Search signer..."
                  />
                )}
                noOptionsText="No signers found"
              />
              <TextField
                size="small"
                label="Level"
                type="number"
                value={row.order}
                onChange={(e) => updateRow(i, 'order', e.target.value)}
                sx={{ flex: 1 }}
                inputProps={{ min: 1 }}
              />
              {rows.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeRow(i)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            variant="outlined"
            size="small"
            onClick={addRow}
            startIcon={<AddIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add another signer
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={tableStyles.addButton}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== Department / Section Tab ====================
function DepartmentSigningFlowTab() {
  const dispatch = useDispatch();
  const { signingFlows, isLoading, filters } = useSelector(
    (state) => state.signingFlow,
  );
  const { departments } = useSelector((state) => state.department);
  const { allSections } = useSelector((state) => state.section);

  const [page] = useState(1);
  const [expandedFlow, setExpandedFlow] = useState({});
  const [addOpen, setAddOpen] = useState(false);

  // Dialog states
  const [selectedSigningFlow, setSelectedSigningFlow] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);

  const handleViewClick = (flow) => {
    setSelectedSigningFlow(flow);
    setOpenView(true);
  };
  const handleCloseView = () => setOpenView(false);
  const handleUpdate = (flow) => {
    setSelectedUpdate(flow);
    setOpenUpdate(true);
  };
  const handleCloseUpdate = () => setOpenUpdate(false);
  const handleDelete = (id) => {
    setSelectedDelete(id);
    setOpenDelete(true);
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const toggleFlow = (id) =>
    setExpandedFlow((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const params = { ...filters };
      user?.role === 'signer_admin'
        ? dispatch(getAllSigningFlowByDepartment(params))
        : dispatch(getAllSigningFlows(params));
    } catch (error) {
      toast.error(error);
    }
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch(getAllSectionsWithNoPagination());
  }, [dispatch]);
  useEffect(() => {
    dispatch(getAllDepartment({ page }));
  }, [dispatch, page]);
  useEffect(() => {
    dispatch(getAllSigners());
  }, [dispatch]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const sectionOptions =
    allSections?.results?.map((s) => ({ value: s.id, label: s.name })) || [];
  const departmentOptions =
    departments?.results?.map((d) => ({ value: d.id, label: d.name })) || [];

  const filterConfig = {
    title: 'Signing Flow Filters',
    fields: [
      {
        name: 'section',
        label: 'section_by',
        type: 'select',
        options: sectionOptions,
      },
      {
        name: 'department',
        label: 'department_by',
        type: 'select',
        options: departmentOptions,
      },
    ],
  };

  const rows = Array.isArray(signingFlows) ? signingFlows : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header — matches CC & Location pattern */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#00529B">
            Department / Section Signing Flow
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage signers assigned to each department and section
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={tableStyles.addButton}
          onClick={() => setAddOpen(true)}
        >
          Add Signing Flow
        </Button>
      </Box>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        config={filterConfig}
      />

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={tableStyles.header}>NO.</TableCell>
              <TableCell sx={tableStyles.header}>DEPARTMENT</TableCell>
              <TableCell sx={tableStyles.header}>SECTION</TableCell>
              <TableCell sx={tableStyles.header}>SIGNERS COUNT</TableCell>
              <TableCell sx={tableStyles.header}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No signing flows found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((flow, index) => {
                const rowKey = flow?.id || index;
                const levels = flow?.levels || [];

                return (
                  <React.Fragment key={rowKey}>
                    {/* Main row */}
                    <TableRow
                      hover
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: expandedFlow[rowKey]
                          ? 'rgba(0,82,155,0.04)'
                          : 'inherit',
                      }}
                      onClick={() => toggleFlow(rowKey)}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>
                          {flow?.department_detail?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{flow?.section_detail?.name || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${levels.length} signer${levels.length !== 1 ? 's' : ''}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          sx={tableStyles.rowButton}
                          startIcon={<VisibilityOutlinedIcon />}
                          onClick={() => handleViewClick(flow)}
                        />
                        <Button
                          sx={tableStyles.rowButton}
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => handleUpdate(flow)}
                        />
                        <IconButton
                          size="small"
                          onClick={() => toggleFlow(rowKey)}
                        >
                          {expandedFlow[rowKey] ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* Expanded signer rows */}
                    <TableRow>
                      <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                        <Collapse
                          in={!!expandedFlow[rowKey]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ mx: 4, my: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    sx={{
                                      fontWeight: 'bold',
                                      color: '#00529B',
                                    }}
                                  >
                                    LEVEL
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: 'bold',
                                      color: '#00529B',
                                    }}
                                  >
                                    SIGNER
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: 'bold',
                                      color: '#00529B',
                                    }}
                                  >
                                    POSITION
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: 'bold',
                                      color: '#00529B',
                                    }}
                                  >
                                    STATUS
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {levels.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={4}
                                      align="center"
                                      sx={{ py: 2 }}
                                    >
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        No signers configured
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  levels.map((level, i) => (
                                    <TableRow key={i} hover>
                                      <TableCell>
                                        <Chip
                                          label={`#${level?.level || i + 1}`}
                                          size="small"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {level?.approver_detail?.firstname}{' '}
                                        {level?.approver_detail?.lastname}
                                      </TableCell>
                                      <TableCell>
                                        {level?.approver_detail?.position ||
                                          '—'}
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={level?.status || 'active'}
                                          size="small"
                                          color={
                                            level?.status === 'active'
                                              ? 'success'
                                              : 'default'
                                          }
                                          variant="outlined"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Dialog */}
      <AddDeptSigningFlowDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      {/* View / Edit / Delete Dialogs */}
      {selectedSigningFlow && (
        <ViewSigningFlowModal
          defaultValues={selectedSigningFlow}
          open={openView}
          handleClose={handleCloseView}
        />
      )}
      {selectedUpdate && (
        <UpdateSigningFlow
          defaultValues={selectedUpdate}
          open={openUpdate}
          handleClose={handleCloseUpdate}
        />
      )}
      <DeleteSigningFlowDialog
        open={openDelete}
        handleClose={handleCloseDelete}
        defaultValues={selectedDelete}
      />
    </Box>
  );
}

// ==================== Main Page ====================
export const SigningFlow = ({ defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync when navigating between Signing Flow sidebar links
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <RootLayout>
      <Box>
        {/* Page header */}
        <Typography variant="h5" fontWeight="bold" color="#00529B" mb={1}>
          Signing Flow
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Manage approval signing flows for departments, cost centers and
          locations
        </Typography>

        {/* Tab bar */}
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              backgroundColor: '#f5f8fc',
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 500,
                minHeight: 48,
                gap: 0.5,
              },
              '& .Mui-selected': {
                color: '#00529B !important',
                fontWeight: 700,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00529B',
              },
            }}
          >
            <Tab
              label="Department / Section"
              icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Cost Center"
              icon={<AccountTreeIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Location"
              icon={<LocationOnIcon fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>

          {/* Tab 0 — Department / Section */}
          <TabPanel value={activeTab} index={0}>
            <DepartmentSigningFlowTab />
          </TabPanel>

          {/* Tab 1 — Cost Center */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              <CostCenterSigningFlow />
            </Box>
          </TabPanel>

          {/* Tab 2 — Location */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <LocationSigningFlow />
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </RootLayout>
  );
};
