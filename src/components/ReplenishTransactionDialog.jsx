import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { toast } from 'react-toastify';
import { replenishPettyCash } from '../features/pettyCash/pettyCashSlice';

const styles = {
  section: {
    mb: 3,
    p: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
    borderRadius: 1,
  },
  fieldLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#666',
    mb: 0.5,
  },
  uploadBox: {
    border: '2px dashed rgba(0, 82, 155, 0.3)',
    borderRadius: '8px',
    p: 2,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 82, 155, 0.05)',
      borderColor: 'rgba(0, 82, 155, 0.5)',
    },
  },
};

const emptyForm = {
  issue_date: '',
  notes: '',
  supporting_document: null,
};

const ReplenishTransactionDialog = ({
  open,
  handleClose,
  transaction,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.pettyCash);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, supporting_document: file }));
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, supporting_document: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.issue_date)
      newErrors.issue_date = 'Issue date is required.';
    if (!formData.supporting_document)
      newErrors.supporting_document = 'A supporting document is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const submitData = new FormData();
    submitData.append('issue_date', formData.issue_date);
    if (formData.notes) submitData.append('notes', formData.notes);
    submitData.append('supporting_document', formData.supporting_document);
    if (transaction?.replenishment_amount) {
      submitData.append('replenishment_amount', transaction.replenishment_amount);
    }

    try {
      await dispatch(replenishPettyCash({ id: transaction.id, formData: submitData })).unwrap();
      toast.success('Replenishment submitted successfully');
      setFormData(emptyForm);
      setErrors({});
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error || 'Failed to submit replenishment');
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setErrors({});
    handleClose();
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#00529B',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CurrencyExchangeIcon sx={{ fontSize: 26 }} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Replenishment / Top-Up
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {transaction?.holder?.firstname} {transaction?.holder?.lastname}
            </Typography>
          </Box>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCancel}
          size="small"
          sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, px: 3 }}>
        {/* Current Balance Summary */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2,
            bgcolor: 'rgba(0, 82, 155, 0.04)',
            borderRadius: 2,
            border: '1px solid rgba(0, 82, 155, 0.15)',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} color="#00529B" gutterBottom>
            Current Transaction Summary
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Original Amount
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatAmount(transaction?.amount)} {transaction?.currency}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Remaining Balance
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                color={
                  parseFloat(transaction?.remaining_amount) <
                  parseFloat(transaction?.amount) * 0.2
                    ? '#EF5350'
                    : '#66BB6A'
                }
              >
                {formatAmount(transaction?.remaining_amount)} {transaction?.currency}
              </Typography>
            </Grid>
            {transaction?.replenishment_amount && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Replenishment Amount
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#00529B">
                  {formatAmount(transaction.replenishment_amount)} {transaction?.currency}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Replenishment Details */}
        <Paper elevation={0} sx={styles.section}>
          <Typography variant="subtitle1" fontWeight={600} color="#00529B" gutterBottom>
            Replenishment Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography sx={styles.fieldLabel}>Issue Date *</Typography>
              <TextField
                fullWidth
                name="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.issue_date}
                helperText={errors.issue_date}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#00529B',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography sx={styles.fieldLabel}>
                Notes / Purpose <span style={{ color: '#999', fontWeight: 400 }}>(Optional)</span>
              </Typography>
              <TextField
                fullWidth
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Describe the purpose of this replenishment..."
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#00529B',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Supporting Document */}
        <Paper elevation={0} sx={{ ...styles.section, mb: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} color="#00529B" gutterBottom>
            Supporting Document *
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              ...styles.uploadBox,
              borderColor: errors.supporting_document
                ? '#d32f2f'
                : 'rgba(0, 82, 155, 0.3)',
            }}
          >
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="replenish-file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="replenish-file-upload">
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 36, color: '#00529B', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Click to upload supporting document
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                  PDF, DOC, DOCX, or image files
                </Typography>
              </Box>
            </label>
          </Box>

          {errors.supporting_document && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.supporting_document}
            </Typography>
          )}

          {formData.supporting_document && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                mt: 2,
                bgcolor: 'rgba(0, 82, 155, 0.05)',
                borderRadius: 1,
                border: '1px solid rgba(0, 82, 155, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachFileIcon sx={{ mr: 1, color: '#00529B', fontSize: 20 }} />
                <Typography variant="body2">
                  {formData.supporting_document.name}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                sx={{ color: '#d32f2f' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={handleCancel}
          disabled={isLoading}
          variant="outlined"
          sx={{
            color: '#666',
            borderColor: '#ddd',
            textTransform: 'none',
            px: 3,
            '&:hover': { borderColor: '#999', bgcolor: 'rgba(0,0,0,0.02)' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : (
              <CurrencyExchangeIcon />
            )
          }
          sx={{
            bgcolor: '#00529B',
            '&:hover': { bgcolor: '#003d73' },
            textTransform: 'none',
            px: 3,
            fontWeight: 600,
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit Replenishment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReplenishTransactionDialog;