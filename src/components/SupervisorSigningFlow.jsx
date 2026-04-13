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
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { toast } from 'react-toastify';
import {
  getAllSupervisors,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
} from '../features/signingFlow/signingFlowSlice';
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
};

// ==================== Add Dialog ====================
function AddSupervisorDialog({ open, onClose, isLoading, signersList }) {
  const dispatch = useDispatch();
  const [signer, setSigner] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const signerOptions = signersList.map((s) => ({
    id: s.id,
    label: `${s.firstname} ${s.lastname}`,
  }));

  useEffect(() => {
    if (open) {
      setSigner(null);
      setIsActive(true);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!signer) {
      toast.error('Please select a signer');
      return;
    }
    const res = await dispatch(
      createSupervisor({ signer: signer.id, is_active: isActive }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Supervisor created successfully');
      dispatch(getAllSupervisors());
      onClose();
    } else {
      toast.error(res.payload || 'Failed to create supervisor');
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
        Add Supervisor
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={signerOptions}
            value={signer}
            onChange={(_, newValue) => setSigner(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
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
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#00529B' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#00529B',
                  },
                }}
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
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={styles.addButton}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== Edit Dialog ====================
function EditSupervisorDialog({
  open,
  onClose,
  supervisor,
  isLoading,
  signersList,
}) {
  const dispatch = useDispatch();
  const [signer, setSigner] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const signerOptions = signersList.map((s) => ({
    id: s.id,
    label: `${s.firstname} ${s.lastname}`,
  }));

  useEffect(() => {
    if (open && supervisor) {
      // Try to find a matching option from signersList; fallback to stored name
      const match = signersList.find((s) => s.id === supervisor.signer);
      if (match) {
        setSigner({
          id: match.id,
          label: `${match.firstname} ${match.lastname}`,
        });
      } else if (supervisor.signer_name) {
        setSigner({ id: supervisor.signer, label: supervisor.signer_name });
      } else {
        setSigner(null);
      }
      setIsActive(supervisor.is_active ?? true);
    }
  }, [open, supervisor, signersList]);

  const handleUpdate = async () => {
    if (!signer) {
      toast.error('Please select a signer');
      return;
    }
    const res = await dispatch(
      updateSupervisor({
        id: supervisor.id,
        data: { signer: signer.id, is_active: isActive },
      }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Supervisor updated successfully');
      dispatch(getAllSupervisors());
      onClose();
    } else {
      toast.error(res.payload || 'Failed to update supervisor');
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
        Edit Supervisor
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={signerOptions}
            value={signer}
            onChange={(_, newValue) => setSigner(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
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
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#00529B' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#00529B',
                  },
                }}
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

// ==================== Delete Dialog ====================
function DeleteSupervisorDialog({ open, onClose, supervisor, isLoading }) {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    const res = await dispatch(deleteSupervisor(supervisor.id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Supervisor deleted successfully');
      dispatch(getAllSupervisors());
      onClose();
    } else {
      toast.error(res.payload || 'Failed to delete supervisor');
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
          Remove <strong>{supervisor?.signer_name}</strong> as a supervisor?
          This cannot be undone.
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
function SupervisorSigningFlow() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.signingFlow);

  const rawSupervisors = useSelector((s) => s.signingFlow.supervisors);
  const supervisors = Array.isArray(rawSupervisors)
    ? rawSupervisors
    : rawSupervisors?.results || [];

  const rawUsers = useSelector((s) => s.user.users);
  const signersList = Array.isArray(rawUsers)
    ? rawUsers
    : rawUsers?.results || [];

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    dispatch(getAllSupervisors());
    dispatch(getAllSigners());
  }, [dispatch]);

  return (
    <Box>
      {/* Header row */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <SupervisorAccountIcon sx={{ color: '#00529B' }} />
          <Typography variant="h6" fontWeight={600} color="#00529B">
            Supervisors
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={styles.addButton}
          size="small"
        >
          Add Supervisor
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={styles.header}>#</TableCell>
              <TableCell sx={styles.header}>SIGNER</TableCell>
              <TableCell sx={styles.header}>STATUS</TableCell>
              <TableCell sx={styles.header}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} sx={{ color: '#00529B' }} />
                </TableCell>
              </TableRow>
            ) : supervisors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">
                    No supervisors found. Click "Add Supervisor" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              supervisors.map((s, index) => (
                <TableRow key={s.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{s.signer_name || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.is_active ? 'active' : 'inactive'}
                      size="small"
                      color={s.is_active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      sx={{ color: '#00529B' }}
                      onClick={() => {
                        setSelectedSupervisor(s);
                        setEditOpen(true);
                      }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedSupervisor(s);
                        setDeleteOpen(true);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs */}
      <AddSupervisorDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        isLoading={isLoading}
        signersList={signersList}
      />
      {selectedSupervisor && (
        <>
          <EditSupervisorDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            supervisor={selectedSupervisor}
            isLoading={isLoading}
            signersList={signersList}
          />
          <DeleteSupervisorDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            supervisor={selectedSupervisor}
            isLoading={isLoading}
          />
        </>
      )}
    </Box>
  );
}

export default SupervisorSigningFlow;
