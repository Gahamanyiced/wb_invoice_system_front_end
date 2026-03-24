import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePettyCashExpense } from '../features/pettyCash/pettyCashSlice';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';

// ── Constants ─────────────────────────────────────────────────────────────────

const styles = {
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

// ── Component ─────────────────────────────────────────────────────────────────

// request prop shape (flat expense line):
// { id, date, item_description, amount, currency, supporting_document, created_at }

const EditExpenseModal = ({
  open,
  handleClose,
  request,
  onUpdate,
  currencies,
}) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.pettyCash);

  const [formData, setFormData] = useState({
    date: '',
    item_description: '',
    amount: '',
    currency: 'USD',
    new_documents: [], // changed: array of newly selected File objects
    existing_document: null, // current URL from API (unchanged)
  });

  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  // Pre-fill when modal opens / expense changes
  useEffect(() => {
    if (request) {
      setFormData({
        date: request.date || '',
        item_description: request.item_description || '',
        amount: request.amount || '',
        currency: request.currency || 'USD',
        new_documents: [], // changed: reset to empty array
        existing_document: request.supporting_document || null,
      });
      setComment('');
      setCommentError('');
    }
  }, [request]);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // changed: append new files, skip duplicates by filename
  const handleFileChange = (newFiles) => {
    setFormData((prev) => {
      const existingNames = new Set(prev.new_documents.map((f) => f.name));
      const unique = newFiles.filter((f) => !existingNames.has(f.name));
      return { ...prev, new_documents: [...prev.new_documents, ...unique] };
    });
  };

  // changed: remove a single new file by index
  const handleRemoveNewFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      new_documents: prev.new_documents.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveExistingDocument = () => {
    setFormData((prev) => ({ ...prev, existing_document: null }));
  };

  const handleClose_ = () => {
    setComment('');
    setCommentError('');
    handleClose();
  };

  // ── Submit → updatePettyCashExpense ───────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setCommentError('Please provide a reason for this edit');
      return;
    }
    setCommentError('');

    const payload = new FormData();
    payload.append('date', formData.date);
    payload.append('item_description', formData.item_description);
    payload.append('amount', formData.amount);
    payload.append('currency', formData.currency);
    payload.append('comment', comment.trim());

    // Each file gets a unique key: expense_documents_0_<fileIndex>
    // Edit always targets a single expense line so line index is fixed at 0
    formData.new_documents.forEach((file, j) => {
      payload.append(`expense_documents_0_${j}`, file);
    });

    if (onUpdate) {
      // Delegate to parent (ManageExpenses.handleEditSubmit)
      onUpdate(request.id, payload);
    } else {
      // Standalone fallback
      const result = await dispatch(
        updatePettyCashExpense({ id: request.id, formData: payload }),
      );
      if (updatePettyCashExpense.fulfilled.match(result)) {
        toast.success('Expense updated successfully.');
        handleClose_();
      } else {
        toast.error(result.payload || 'Failed to update expense.');
      }
    }
  };

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose_}
      maxWidth="sm"
      fullWidth
      scroll="paper"
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#FFA726',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Edit Expense
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            ID #{request.id}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose_}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            {/* Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date *"
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount *"
                type="number"
                value={formData.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                required
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                size="small"
              />
            </Grid>

            {/* Currency — locked to the expense's existing currency */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required size="small">
                <InputLabel>Currency</InputLabel>
                <Select value={formData.currency} label="Currency" disabled>
                  {(currencies || []).map((curr) => (
                    <MenuItem key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.code} — {curr.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                Currency is fixed to the transaction currency
              </Typography>
            </Grid>

            {/* Item Description */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Description *"
                value={formData.item_description}
                onChange={(e) =>
                  handleFieldChange('item_description', e.target.value)
                }
                required
                size="small"
              />
            </Grid>

            {/* Supporting Documents — changed to multi-file */}
            <Grid item xs={12}>
              <Typography
                variant="caption"
                sx={{
                  color: '#00529B',
                  fontWeight: 600,
                  display: 'block',
                  mb: 1,
                }}
              >
                Supporting Documents
              </Typography>

              {/* Existing document from API */}
              {formData.existing_document && (
                <Box
                  sx={{
                    mb: 1,
                    p: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(0, 82, 155, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(0, 82, 155, 0.15)',
                  }}
                >
                  <Box
                    onClick={() =>
                      window.open(formData.existing_document, '_blank')
                    }
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                  >
                    <AttachFileIcon
                      sx={{ mr: 1, color: '#00529B', fontSize: 16 }}
                    />
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      Current: {formData.existing_document.split('/').pop()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: '#00529B', fontWeight: 600, mr: 1 }}
                    >
                      View
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={handleRemoveExistingDocument}
                    sx={{ color: '#d32f2f', p: '2px' }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              )}

              {/* Upload box — always visible to allow adding more files */}
              <Box sx={styles.uploadBox}>
                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="edit-expense-file"
                  type="file"
                  multiple
                  onChange={(e) => {
                    handleFileChange(Array.from(e.target.files));
                    e.target.value = '';
                  }}
                />
                <label htmlFor="edit-expense-file">
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <CloudUploadIcon
                      sx={{ fontSize: 28, color: '#00529B', mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formData.new_documents.length > 0
                        ? 'Click to add more documents'
                        : formData.existing_document
                          ? 'Click to add new documents'
                          : 'Click to upload documents'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.25 }}
                    >
                      Multiple files allowed
                    </Typography>
                  </Box>
                </label>
              </Box>

              {/* Newly selected files list */}
              {formData.new_documents.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {formData.new_documents.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.25,
                        mt: 0.75,
                        bgcolor: 'rgba(0, 82, 155, 0.05)',
                        borderRadius: 1,
                        border: '1px solid rgba(0, 82, 155, 0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachFileIcon
                          sx={{ mr: 1, color: '#00529B', fontSize: 16 }}
                        />
                        <Typography variant="caption">{file.name}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 0.75 }}
                        >
                          ({(file.size / 1024).toFixed(1)} KB)
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveNewFile(index)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Reason for Edit — mandatory */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255, 167, 38, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 167, 38, 0.3)',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#E65100', fontWeight: 600, mb: 1 }}
                >
                  Reason for Edit{' '}
                  <Typography component="span" color="error">
                    *
                  </Typography>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe why this expense is being edited..."
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setCommentError('');
                  }}
                  error={!!commentError}
                  helperText={commentError}
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#FFA726' },
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={handleClose_}
            disabled={isLoading}
            sx={{ color: '#666', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : null
            }
            sx={{
              bgcolor: '#FFA726',
              '&:hover': { bgcolor: '#F57C00' },
              textTransform: 'none',
              minWidth: 140,
              px: 3,
            }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditExpenseModal;
