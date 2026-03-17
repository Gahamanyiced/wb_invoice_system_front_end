import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import {
  getAllLocationSigners,
  createLocationSigner,
  updateLocationSigner,
  deleteLocationSigner,
} from '../features/signingFlow/signingFlowSlice';
import { getAllLocations } from '../features/coa/coaSlice';
import { getAllSigners } from '../features/user/userSlice';

const styles = {
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
  rowButton: { minWidth: 'unset', padding: '4px', color: '#00529B' },
};

// ---- Add Signer(s) Dialog ----
function AddLocationSignerDialog({
  open,
  onClose,
  isLoading,
  locations,
  signersList,
}) {
  const dispatch = useDispatch();
  const [location, setLocation] = useState(null);
  const [rows, setRows] = useState([{ signer: null, order: 1 }]);

  const locationOptions = (locations?.results || []).map((loc) => ({
    id: loc.id,
    label: `${loc.loc_code} — ${loc.loc_name}`,
  }));

  const signerOptions = signersList.map((s) => ({
    id: s.id,
    label: `${s.firstname} ${s.lastname}`,
  }));

  useEffect(() => {
    if (open) {
      setLocation(null);
      setRows([{ signer: null, order: 1 }]);
    }
  }, [open]);

  const addRow = () =>
    setRows([...rows, { signer: null, order: rows.length + 1 }]);

  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const updateRow = (i, field, value) => {
    const updated = [...rows];
    updated[i] = { ...updated[i], [field]: value };
    setRows(updated);
  };

  const handleSubmit = async () => {
    if (!location) {
      toast.error('Please select a Location');
      return;
    }
    for (const r of rows) {
      if (!r.signer || !r.order) {
        toast.error('All signer rows must have a signer and order');
        return;
      }
    }

    const payload =
      rows.length === 1
        ? {
            location: location.id,
            signer: rows[0].signer.id,
            order: Number(rows[0].order),
          }
        : {
            location: location.id,
            signers: rows.map((r) => ({
              signer: r.signer.id,
              order: Number(r.order),
            })),
          };

    const res = await dispatch(createLocationSigner(payload));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Location signing flow created successfully');
      dispatch(getAllLocationSigners());
      onClose();
    } else {
      toast.error(res.payload || 'Failed to create');
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
        Add Location Signing Flow
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={locationOptions}
            value={location}
            onChange={(_, newValue) => setLocation(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location"
                size="small"
                required
                placeholder="Search by code or name..."
              />
            )}
            noOptionsText="No locations found"
          />

          <Typography variant="subtitle2" color="text.secondary">
            Signers (in order)
          </Typography>

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
                label="Order"
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
          sx={styles.addButton}
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

// ---- Edit Order Dialog ----
function EditOrderDialog({ open, onClose, signer, isLoading }) {
  const dispatch = useDispatch();
  const [order, setOrder] = useState('');

  useEffect(() => {
    if (open && signer) setOrder(signer.order || '');
  }, [open, signer]);

  const handleSubmit = async () => {
    if (!order) {
      toast.error('Order is required');
      return;
    }
    const res = await dispatch(
      updateLocationSigner({ id: signer.id, data: { order: Number(order) } }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Signer order updated');
      dispatch(getAllLocationSigners());
      onClose();
    } else {
      toast.error(res.payload || 'Failed to update');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: '#00529B',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Edit Signer Order
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          inputProps={{ min: 1 }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={styles.addButton}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Update'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- Delete Dialog ----
function DeleteSignerDialog({ open, onClose, signer, isLoading }) {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    const res = await dispatch(deleteLocationSigner(signer.id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Signer removed from signing flow');
      dispatch(getAllLocationSigners());
      onClose();
    } else {
      toast.error(res.payload || 'Failed to delete');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: '#d32f2f',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Confirm Delete
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography>
          Remove <strong>{signer?.signer_name}</strong> from this Location's
          signing flow? This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Delete'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== Main Component ====================
function LocationSigningFlow() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.signingFlow);

  // API returns { count, results: [...] }
  const rawSigners = useSelector((s) => s.signingFlow.locationSigners);
  const locationSigners = Array.isArray(rawSigners)
    ? rawSigners
    : rawSigners?.results || [];

  const { locations } = useSelector((s) => s.coa);

  const rawUsers = useSelector((s) => s.user.users);
  const signersList = Array.isArray(rawUsers)
    ? rawUsers
    : rawUsers?.results || [];

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [expandedLoc, setExpandedLoc] = useState({});

  useEffect(() => {
    dispatch(getAllLocationSigners());
    dispatch(getAllLocations());
    dispatch(getAllSigners());
  }, [dispatch]);

  // Group by location id using flat API fields
  // Each item: { id, location, location_name, signer, signer_name, order, is_active }
  const grouped = locationSigners.reduce((acc, item) => {
    const key = item.location;
    if (!acc[key]) {
      acc[key] = {
        locationName: item.location_name,
        signers: [],
      };
    }
    acc[key].signers.push(item);
    return acc;
  }, {});

  const toggleLoc = (id) =>
    setExpandedLoc((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Box>
      {/* Header */}
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
            Location Signing Flow
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage signers assigned to each location
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={styles.addButton}
          onClick={() => setAddOpen(true)}
        >
          Add Signing Flow
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={styles.header}>NO.</TableCell>
              <TableCell sx={styles.header}>LOCATION</TableCell>
              <TableCell sx={styles.header}>SIGNERS COUNT</TableCell>
              <TableCell sx={styles.header}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : Object.keys(grouped).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No signing flows found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(grouped).map(([locId, group], index) => (
                <React.Fragment key={locId}>
                  {/* Location row */}
                  <TableRow
                    hover
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: expandedLoc[locId]
                        ? 'rgba(0,82,155,0.04)'
                        : 'inherit',
                    }}
                    onClick={() => toggleLoc(locId)}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {group.locationName || `Location #${locId}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${group.signers.length} signer${
                          group.signers.length !== 1 ? 's' : ''
                        }`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        {expandedLoc[locId] ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* Expanded signer rows */}
                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                      <Collapse
                        in={!!expandedLoc[locId]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ mx: 4, my: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  sx={{ fontWeight: 'bold', color: '#00529B' }}
                                >
                                  ORDER
                                </TableCell>
                                <TableCell
                                  sx={{ fontWeight: 'bold', color: '#00529B' }}
                                >
                                  SIGNER
                                </TableCell>
                                <TableCell
                                  sx={{ fontWeight: 'bold', color: '#00529B' }}
                                >
                                  STATUS
                                </TableCell>
                                <TableCell
                                  sx={{ fontWeight: 'bold', color: '#00529B' }}
                                >
                                  ACTIONS
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {group.signers
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map((s) => (
                                  <TableRow key={s.id} hover>
                                    <TableCell>
                                      <Chip
                                        label={`#${s.order}`}
                                        size="small"
                                      />
                                    </TableCell>
                                    {/* FIX: use flat field location_name */}
                                    <TableCell>
                                      {s.signer_name || '—'}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={
                                          s.is_active ? 'Active' : 'Inactive'
                                        }
                                        size="small"
                                        color={
                                          s.is_active ? 'success' : 'default'
                                        }
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        sx={styles.rowButton}
                                        startIcon={<EditOutlinedIcon />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSigner(s);
                                          setEditOpen(true);
                                        }}
                                      />
                                      <Button
                                        sx={{
                                          ...styles.rowButton,
                                          color: '#d32f2f',
                                        }}
                                        startIcon={<DeleteOutlineIcon />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSigner(s);
                                          setDeleteOpen(true);
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs */}
      <AddLocationSignerDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        isLoading={isLoading}
        locations={locations}
        signersList={signersList}
      />
      <EditOrderDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedSigner(null);
        }}
        signer={selectedSigner}
        isLoading={isLoading}
      />
      <DeleteSignerDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedSigner(null);
        }}
        signer={selectedSigner}
        isLoading={isLoading}
      />
    </Box>
  );
}

export default LocationSigningFlow;
