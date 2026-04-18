import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Divider,
  Chip,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { rollbackInvoiceToSupplier } from '../features/invoice/invoiceSlice';

// Available statuses the user can set
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'denied', label: 'Denied' },
  { value: 'rollback', label: 'Rollback' },
];

const STATUS_COLORS = {
  pending: '#ed6c02',
  denied: '#d32f2f',
  rollback: '#2e7d32',
};

export default function RollbackInvoiceToSupplierDialog({
  open,
  handleClose,
  invoice,
  onSuccess,
}) {
  const dispatch = useDispatch();

  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusError, setStatusError] = useState('');
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset fields on open
  useEffect(() => {
    if (!open) return;
    setSelectedStatus('');
    setStatusError('');
    setReason('');
    setReasonError('');
  }, [open]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    let valid = true;

    if (!selectedStatus) {
      setStatusError('Please select a status');
      valid = false;
    } else {
      setStatusError('');
    }

    if (!reason.trim()) {
      setReasonError('Please provide a reason');
      valid = false;
    } else {
      setReasonError('');
    }

    if (!valid) return;

    setSubmitting(true);
    try {
      const result = await dispatch(
        rollbackInvoiceToSupplier({
          invoiceId: invoice?.id,
          data: { status: selectedStatus, reason: reason.trim() },
        }),
      );

      if (rollbackInvoiceToSupplier.fulfilled.match(result)) {
        toast.success(
          `Invoice status changed to "${selectedStatus}" successfully`,
        );
        onSuccess?.();
        handleClose();
      } else {
        toast.error(result.payload || 'Failed to change invoice status');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    handleClose();
  };

  // ── Invoice summary ───────────────────────────────────────────────────────
  const invoiceNumber = invoice?.invoice_number || `#${invoice?.id}`;
  const supplierName = invoice?.supplier_name || '—';

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          bgcolor: '#00529B',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SwapVertIcon />
          <Typography variant="h6" fontWeight={600}>
            Change Invoice Status
          </Typography>
        </Box>
        <IconButton
          onClick={handleCloseDialog}
          disabled={submitting}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3, pb: 1 }}>
        {/* ── Invoice summary ── */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: '#f0f7ff',
            borderRadius: 1,
            border: '1px solid #cce0ff',
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            INVOICE
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 0.5,
              flexWrap: 'wrap',
            }}
          >
            <Chip
              label={invoiceNumber}
              size="small"
              sx={{ bgcolor: '#00529B', color: 'white', fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary">
              {supplierName}
            </Typography>
            {invoice?.status && (
              <Chip
                label={`Current: ${invoice.status}`}
                size="small"
                color={
                  invoice.status === 'pending'
                    ? 'warning'
                    : invoice.status === 'approved'
                      ? 'success'
                      : invoice.status === 'denied'
                        ? 'error'
                        : 'default'
                }
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* ── Status selector ── */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            New Status <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl fullWidth error={!!statusError}>
            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                if (e.target.value) setStatusError('');
              }}
              displayEmpty
              renderValue={(value) =>
                value ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: STATUS_COLORS[value] || '#757575',
                      }}
                    />
                    <Typography>
                      {STATUS_OPTIONS.find((o) => o.value === value)?.label}
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Select a status...
                  </Typography>
                )
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: STATUS_COLORS[option.value],
                      }}
                    />
                    <Typography>{option.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {statusError && <FormHelperText>{statusError}</FormHelperText>}
          </FormControl>
        </Box>

        {/* ── Reason ── */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Reason <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Explain the reason for this status change..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setReasonError('');
            }}
            error={!!reasonError}
            helperText={reasonError}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleCloseDialog}
          disabled={submitting}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          startIcon={
            submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SwapVertIcon />
            )
          }
          sx={{ bgcolor: '#00529B', '&:hover': { bgcolor: '#003d75' } }}
        >
          {submitting ? 'Applying...' : 'Apply Status Change'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
