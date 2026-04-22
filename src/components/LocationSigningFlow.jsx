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
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
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

  const locationOptions = (
    locations?.results || (Array.isArray(locations) ? locations : [])
  ).map((l) => ({
    id: l.id,
    label: `${l.loc_code} — ${l.loc_name}`,
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

// ---- Edit Signer Dialog ----
function EditLocationSignerDialog({
  open,
  onClose,
  signer,
  isLoading,
  signersList,
}) {
  const dispatch = useDispatch();
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [order, setOrder] = useState('');
  const [isActive, setIsActive] = useState(true);

  const signerOptions = signersList.map((s) => ({
    id: s.id,
    label: `${s.firstname} ${s.lastname}`,
  }));

  useEffect(() => {
    if (open && signer) {
      setOrder(signer.order ?? '');
      setIsActive(signer.is_active ?? true);
      const matched = signerOptions.find((o) => o.id === signer.signer) || null;
      setSelectedSigner(matched);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, signer]);

  const handleUpdate = async () => {
    if (!selectedSigner) {
      toast.error('Please select a signer');
      return;
    }
    if (!order) {
      toast.error('Please enter an order');
      return;
    }
    const res = await dispatch(
      updateLocationSigner({
        id: signer.id,
        data: {
          signer: selectedSigner.id,
          order: Number(order),
          is_active: isActive,
        },
      }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Signer updated successfully');
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
        Edit Signer
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={signerOptions}
            value={selectedSigner}
            onChange={(_, newValue) => setSelectedSigner(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Signer" size="small" required />
            )}
            noOptionsText="No signers found"
          />
          <TextField
            size="small"
            label="Order"
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            inputProps={{ min: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                {isActive ? 'Active' : 'Inactive'}
              </Typography>
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
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
    const res = await dispatch(
      deleteLocationSigner({ id: signer.id, data: { order: signer.order } }),
    );
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
  const [search, setSearch] = useState(''); // ← added

  useEffect(() => {
    dispatch(getAllLocationSigners());
    dispatch(getAllLocations());
    dispatch(getAllSigners());
  }, [dispatch]);

  const toggleLoc = (id) =>
    setExpandedLoc((prev) => ({ ...prev, [id]: !prev[id] }));

  // Group by location id
  const grouped = locationSigners.reduce((acc, item) => {
    const key = item.location;
    if (!acc[key]) {
      acc[key] = { locationName: item.location_name, signers: [] };
    }
    acc[key].signers.push(item);
    return acc;
  }, {});

  // ── Client-side filter by location name ────────────────────────────────────
  const filteredEntries = Object.entries(grouped).filter(
    ([, group]) =>
      !search.trim() ||
      group.locationName?.toLowerCase().includes(search.trim().toLowerCase()),
  );

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

      {/* Search field */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
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
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {search
                      ? 'No results match your search'
                      : 'No signing flows found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map(([locId, group], index) => (
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
                                    <TableCell>
                                      {s.signer_name || '—'}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={
                                          s.is_active ? 'active' : 'inactive'
                                        }
                                        size="small"
                                        color={
                                          s.is_active ? 'success' : 'default'
                                        }
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <IconButton
                                        size="small"
                                        sx={{ color: '#00529B' }}
                                        onClick={() => {
                                          setSelectedSigner(s);
                                          setEditOpen(true);
                                        }}
                                      >
                                        <EditOutlinedIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                          setSelectedSigner(s);
                                          setDeleteOpen(true);
                                        }}
                                      >
                                        <DeleteOutlineIcon fontSize="small" />
                                      </IconButton>
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
      {selectedSigner && (
        <>
          <EditLocationSignerDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            signer={selectedSigner}
            isLoading={isLoading}
            signersList={signersList}
          />
          <DeleteSignerDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            signer={selectedSigner}
            isLoading={isLoading}
          />
        </>
      )}
    </Box>
  );
}

export default LocationSigningFlow;
