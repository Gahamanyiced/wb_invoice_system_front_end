import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { toast } from 'react-toastify';

import RootLayout from '../layouts/RootLayout';
import {
  getAllDelegations,
  createDelegation,
  updateDelegation,
  deleteDelegation,
} from '../features/delegation/delegationSlice';
import { getAllSigners } from '../features/user/userSlice';

// ==================== Shared styles ====================
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

// ==================== Add Dialog ====================
function AddDelegationDialog({ open, onClose, isLoading, signersList, isAdmin }) {
  const dispatch = useDispatch();

  const [delegator, setDelegator] = useState(null);
  const [substitute, setSubstitute] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const signerOptions = signersList.map((s) => ({
    id: s.id,
    label: `${s.firstname} ${s.lastname}`,
  }));

  useEffect(() => {
    if (open) {
      setDelegator(null);
      setSubstitute(null);
      setStartDate('');
      setEndDate('');
      setReason('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (isAdmin && !delegator) {
      toast.error('Please select a Delegator');
      return;
    }
    if (!substitute) {
      toast.error('Please select a Substitute');
      return;
    }
    if (!startDate) {
      toast.error('Start date is required');
      return;
    }
    if (!endDate) {
      toast.error('End date is required');
      return;
    }
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }

    // Build payload based on role
    const payload = isAdmin
      ? {
          delegator: delegator.id,
          substitute: substitute.id,
          start_date: startDate,
          end_date: endDate,
          reason,
        }
      : {
          substitute: substitute.id,
          start_date: startDate,
          end_date: endDate,
          reason,
        };

    const res = await dispatch(createDelegation(payload));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Delegation created successfully');
      dispatch(getAllDelegations());
      onClose();
    } else {
      toast.error(res.payload || 'Failed to create delegation');
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
        Add Delegation
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>

          {/* Delegator — admin only */}
          {isAdmin && (
            <Autocomplete
              options={signerOptions}
              value={delegator}
              onChange={(_, newValue) => setDelegator(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Delegator (who is delegating)"
                  size="small"
                  required
                  placeholder="Search signer..."
                />
              )}
              noOptionsText="No signers found"
            />
          )}

          {/* Substitute */}
          <Autocomplete
            options={signerOptions}
            value={substitute}
            onChange={(_, newValue) => setSubstitute(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Substitute (who will sign instead)"
                size="small"
                required
                placeholder="Search signer..."
              />
            )}
            noOptionsText="No signers found"
          />

          {/* Date range */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              fullWidth
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              fullWidth
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Reason */}
          <TextField
            label="Reason"
            size="small"
            fullWidth
            required
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Annual leave, Medical leave..."
          />
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
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== Edit Dialog ====================
function EditDelegationDialog({ open, onClose, delegation, isLoading }) {
  const dispatch = useDispatch();

  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open && delegation) {
      setEndDate(delegation.end_date || '');
      setReason(delegation.reason || '');
    }
  }, [open, delegation]);

  const handleSubmit = async () => {
    if (!endDate) {
      toast.error('End date is required');
      return;
    }
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }

    const res = await dispatch(
      updateDelegation({ id: delegation.id, data: { end_date: endDate, reason } })
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Delegation updated successfully');
      dispatch(getAllDelegations());
      onClose();
    } else {
      toast.error(res.payload || 'Failed to update delegation');
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
        Edit Delegation
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>

          {/* Read-only info */}
          {delegation && (
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f5f8fc',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
              }}
            >
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Delegator
              </Typography>
              <Typography variant="body1" fontWeight={500} mb={1}>
                {delegation.delegator_name || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Substitute
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {delegation.substitute_name || '—'}
              </Typography>
            </Box>
          )}

          <TextField
            label="End Date"
            type="date"
            size="small"
            fullWidth
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Reason"
            size="small"
            fullWidth
            required
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
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
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== Delete Dialog ====================
function DeleteDelegationDialog({ open, onClose, delegation, isLoading }) {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    const res = await dispatch(deleteDelegation(delegation.id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Delegation deleted successfully');
      dispatch(getAllDelegations());
      onClose();
    } else {
      toast.error(res.payload || 'Failed to delete delegation');
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
          Are you sure you want to delete the delegation from{' '}
          <strong>{delegation?.delegator_name}</strong> to{' '}
          <strong>{delegation?.substitute_name}</strong>? This cannot be
          undone.
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
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== Main Page ====================
function Delegation() {
  const dispatch = useDispatch();
  const { delegations, isLoading } = useSelector((s) => s.delegation);

  const rawUsers = useSelector((s) => s.user.users);
  const signersList = Array.isArray(rawUsers)
    ? rawUsers
    : rawUsers?.results || [];

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const isAdmin =
    loggedInUser?.role === 'admin' || loggedInUser?.role === 'signer_admin';

  // Filter state
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Dialog states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState(null);

  const fetchDelegations = () => {
    const params = showActiveOnly ? { is_active: 'true' } : {};
    dispatch(getAllDelegations(params));
  };

  useEffect(() => {
    fetchDelegations();
    dispatch(getAllSigners());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, showActiveOnly]);

  const rows = delegations?.results || (Array.isArray(delegations) ? delegations : []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <RootLayout>
      <Box>
        {/* Page header */}
        <Typography variant="h5" fontWeight="bold" color="#00529B" mb={1}>
          Delegation
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Manage signing delegations — assign substitutes when signers are
          unavailable
        </Typography>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', p: 3 }}>
          {/* Toolbar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  Show active only
                </Typography>
              }
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={styles.addButton}
              onClick={() => setAddOpen(true)}
            >
              Add Delegation
            </Button>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.header}>NO.</TableCell>
                  <TableCell sx={styles.header}>DELEGATOR</TableCell>
                  <TableCell sx={styles.header}>SUBSTITUTE</TableCell>
                  <TableCell sx={styles.header}>START DATE</TableCell>
                  <TableCell sx={styles.header}>END DATE</TableCell>
                  <TableCell sx={styles.header}>REASON</TableCell>
                  <TableCell sx={styles.header}>STATUS</TableCell>
                  <TableCell sx={styles.header}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No delegations found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>
                          {row.delegator_name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <SwapHorizIcon
                            fontSize="small"
                            sx={{ color: '#00529B', opacity: 0.6 }}
                          />
                          {row.substitute_name || '—'}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(row.start_date)}</TableCell>
                      <TableCell>{formatDate(row.end_date)}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography
                          variant="body2"
                          title={row.reason}
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {row.reason || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={row.is_active ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          sx={styles.rowButton}
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => {
                            setSelectedDelegation(row);
                            setEditOpen(true);
                          }}
                        />
                        <Button
                          sx={{ ...styles.rowButton, color: '#d32f2f' }}
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => {
                            setSelectedDelegation(row);
                            setDeleteOpen(true);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Dialogs */}
        <AddDelegationDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          isLoading={isLoading}
          signersList={signersList}
          isAdmin={isAdmin}
        />

        {selectedDelegation && (
          <>
            <EditDelegationDialog
              open={editOpen}
              onClose={() => {
                setEditOpen(false);
                setSelectedDelegation(null);
              }}
              delegation={selectedDelegation}
              isLoading={isLoading}
            />
            <DeleteDelegationDialog
              open={deleteOpen}
              onClose={() => {
                setDeleteOpen(false);
                setSelectedDelegation(null);
              }}
              delegation={selectedDelegation}
              isLoading={isLoading}
            />
          </>
        )}
      </Box>
    </RootLayout>
  );
}

export default Delegation;