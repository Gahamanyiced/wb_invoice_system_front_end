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
  Autocomplete,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addressInvoiceTo } from '../features/invoice/invoiceSlice';
import http from '../http-common';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fullName = (u) =>
  `${u?.firstname ?? ''} ${u?.lastname ?? ''}`.trim() || `User #${u?.id}`;

export default function AddressInvoiceDialog({
  open,
  handleClose,
  invoice,
  onSuccess,
}) {
  const dispatch = useDispatch();

  const [signers, setSigners] = useState([]);
  const [loadingSigners, setLoadingSigners] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [signerError, setSignerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch signers on open ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setSelectedSigner(null);
    setReason('');
    setReasonError('');
    setSignerError('');

    const fetchSigners = async () => {
      setLoadingSigners(true);
      try {
        const res = await http.get('/auth/user-list/', {
          params: { is_approved: true, role: 'signer_admin' },
        });

        const results = res.data?.results ?? res.data ?? [];
        setSigners(results);
      } catch (err) {
        console.error('Failed to fetch signers:', err);
        toast.error('Failed to load signers list');
        setSigners([]);
      } finally {
        setLoadingSigners(false);
      }
    };

    fetchSigners();
  }, [open]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    let valid = true;

    if (!selectedSigner) {
      setSignerError('Please select a signer to address this invoice to');
      valid = false;
    } else {
      setSignerError('');
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
        addressInvoiceTo({
          invoiceId: invoice?.id,
          data: { verifier_id: selectedSigner.id, reason: reason.trim() },
        }),
      );

      if (addressInvoiceTo.fulfilled.match(result)) {
        toast.success(
          `Invoice addressed to ${fullName(selectedSigner)} successfully`,
        );
        onSuccess?.();
        handleClose();
      } else {
        toast.error(result.payload || 'Failed to address invoice');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    handleClose();
  };

  // ── Invoice summary chip ──────────────────────────────────────────────────
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
          <PersonSearchIcon />
          <Typography variant="h6" fontWeight={600}>
            Address Invoice to Signer
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
                label={invoice.status}
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

        {/* ── Signer selector ── */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Select Signer <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Autocomplete
            options={signers}
            loading={loadingSigners}
            value={selectedSigner}
            onChange={(_, newValue) => {
              setSelectedSigner(newValue);
              if (newValue) setSignerError('');
            }}
            getOptionLabel={(option) =>
              `${fullName(option)} (${option.role?.replace('_', ' ')})`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {fullName(option)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.role?.replace('_', ' ')} •{' '}
                    {option.department || option.section || option.email || ''}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search and select a signer..."
                error={!!signerError}
                helperText={signerError}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingSigners ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
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
            placeholder="Explain why this invoice is being addressed to this signer..."
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
              <SendIcon />
            )
          }
          sx={{ bgcolor: '#00529B', '&:hover': { bgcolor: '#003d75' } }}
        >
          {submitting ? 'Addressing...' : 'Address Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
