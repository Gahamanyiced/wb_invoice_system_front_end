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
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

// ── Styles ────────────────────────────────────────────────────────────────────

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

// ── File preview helper ───────────────────────────────────────────────────────
const previewFile = (file) => {
  const url = URL.createObjectURL(file);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// ── Component ─────────────────────────────────────────────────────────────────

// request prop shape (from API response):
// {
//   id, date, item_description, amount, currency, created_at,
//   documents: [{ id, document_url, document_name, uploaded_by, uploaded_by_id, created_at }]
// }

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
    // Existing docs kept from API — objects: { id, document_url, document_name }
    existing_documents: [],
    // New File objects the user picked via the file input
    new_documents: [],
  });

  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  // ── Pre-fill when modal opens / expense changes ───────────────────────────────
  useEffect(() => {
    if (request) {
      const existingDocs = Array.isArray(request.documents)
        ? request.documents.map((doc) => ({
            id: doc.id,
            document_url: doc.document_url,
            document_name: doc.document_name,
          }))
        : [];

      setFormData({
        date: request.date || '',
        item_description: request.item_description || '',
        amount: request.amount || '',
        currency: request.currency || 'USD',
        existing_documents: existingDocs,
        new_documents: [],
      });
      setComment('');
      setCommentError('');
    }
  }, [request]);

  // ── Field handlers ────────────────────────────────────────────────────────────

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ── New file handlers ─────────────────────────────────────────────────────────

  // Append new files, skip duplicates by filename
  const handleFileChange = (newFiles) => {
    setFormData((prev) => {
      const existingNames = new Set(prev.new_documents.map((f) => f.name));
      const unique = newFiles.filter((f) => !existingNames.has(f.name));
      return { ...prev, new_documents: [...prev.new_documents, ...unique] };
    });
  };

  const handleRemoveNewFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      new_documents: prev.new_documents.filter((_, i) => i !== index),
    }));
  };

  // ── Existing doc handlers ─────────────────────────────────────────────────────

  // Removing an existing doc marks it as deleted — its ID won't be sent in
  // existing_document_ids, so the backend knows to delete it
  const handleRemoveExistingDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      existing_documents: prev.existing_documents.filter((_, i) => i !== index),
    }));
  };

  // ── Close ─────────────────────────────────────────────────────────────────────

  const handleClose_ = () => {
    setComment('');
    setCommentError('');
    handleClose();
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  //
  // Mirrors ManageExpenses → handleSubmit (createPettyCashExpense) exactly:
  //
  //  CREATE payload:
  //    payload.append('petty_cash_id', transactionId)
  //    payload.append('verifier_id', formData.verifier_id)
  //    payload.append('expenses', JSON.stringify(expensesData))     ← array of expense objects
  //    payload.append(`expense_documents_${i}_${j}`, file)          ← files per line
  //
  //  EDIT payload (same shape, single expense line at index 0):
  //    payload.append('expenses', JSON.stringify([{ date, item_description, amount, currency }]))
  //    payload.append('expense_documents_0_0', file)  ← new files, line index fixed at 0
  //    payload.append('existing_document_ids', JSON.stringify([11, ...]))  ← IDs to keep
  //    payload.append('comment', '...')               ← mandatory reason

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setCommentError('Please provide a reason for this edit');
      return;
    }
    setCommentError('');

    const payload = new FormData();

    // ── 1. expenses JSON — same structure as create, single line at index 0 ──
    const expensesData = [
      {
        date: formData.date,
        item_description: formData.item_description,
        amount: formData.amount,
        currency: formData.currency,
      },
    ];
    payload.append('expenses', JSON.stringify(expensesData));

    // ── 2. New files — same key convention as create: expense_documents_<lineIdx>_<fileIdx> ──
    // Line index is always 0 for a single-expense edit
    formData.new_documents.forEach((file, j) => {
      payload.append(`expense_documents_0_${j}`, file);
    });

    // ── 3. IDs of existing documents the user chose to KEEP ──
    // Any doc whose ID is NOT in this list should be deleted by the backend
    const keptDocIds = formData.existing_documents.map((doc) => doc.id);
    payload.append('existing_document_ids', JSON.stringify(keptDocIds));

    // ── 4. Mandatory reason for edit ──
    payload.append('comment', comment.trim());

    if (onUpdate) {
      // Delegate to ManageExpenses → handleEditSubmit(id, payload)
      onUpdate(request.id, payload);
    } else {
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

  const hasExistingDocs = formData.existing_documents.length > 0;
  const hasNewDocs = formData.new_documents.length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose_}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
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
        <Typography variant="h6" fontWeight={600}>
          Edit Expense #{request.id}
        </Typography>
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
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* ── Date ── */}
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
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#FFA726',
                  },
                }}
              />
            </Grid>

            {/* ── Currency (locked to transaction currency) ── */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" disabled>
                <InputLabel>Currency</InputLabel>
                <Select value={formData.currency} label="Currency">
                  <MenuItem value={formData.currency}>
                    {formData.currency}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* ── Item Description ── */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Description *"
                value={formData.item_description}
                onChange={(e) =>
                  handleFieldChange('item_description', e.target.value)
                }
                required
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#FFA726',
                  },
                }}
              />
            </Grid>

            {/* ── Amount ── */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount *"
                type="number"
                value={formData.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                required
                inputProps={{ min: 0, step: '0.01' }}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#FFA726',
                  },
                }}
              />
            </Grid>

            {/* ── Supporting Documents ── */}
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

              {/* ── Existing documents from API ── */}
              {hasExistingDocs && (
                <Box sx={{ mb: 1 }}>
                  {formData.existing_documents.map((doc, idx) => (
                    <Box
                      key={doc.id}
                      sx={{
                        mb: 0.75,
                        p: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(0, 82, 155, 0.05)',
                        borderRadius: 1,
                        border: '1px solid rgba(0, 82, 155, 0.15)',
                      }}
                    >
                      {/* Clickable → opens document in new tab */}
                      <Box
                        onClick={() => window.open(doc.document_url, '_blank')}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: 0,
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 },
                        }}
                      >
                        <AttachFileIcon
                          sx={{
                            mr: 1,
                            color: '#00529B',
                            fontSize: 16,
                            flexShrink: 0,
                          }}
                        />
                        <Tooltip
                          title={doc.document_name}
                          arrow
                          placement="top"
                        >
                          <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                            {doc.document_name}
                          </Typography>
                        </Tooltip>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#00529B',
                            fontWeight: 600,
                            mx: 1,
                            flexShrink: 0,
                          }}
                        >
                          View
                        </Typography>
                      </Box>

                      {/* Remove existing document */}
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveExistingDocument(idx)}
                          sx={{ color: '#d32f2f', p: '2px', flexShrink: 0 }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              )}

              {/* ── Upload box — always visible so user can add new files ── */}
              <Box sx={styles.uploadBox}>
                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="edit-expense-file"
                  type="file"
                  multiple
                  onChange={(e) => {
                    handleFileChange(Array.from(e.target.files));
                    e.target.value = ''; // reset so the same file can be re-selected
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
                      {hasNewDocs
                        ? 'Click to add more documents'
                        : hasExistingDocs
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

              {/* ── Newly selected files list ── */}
              {hasNewDocs && (
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
                      {/* Left: icon + name + size */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <AttachFileIcon
                          sx={{
                            mr: 1,
                            color: '#00529B',
                            fontSize: 16,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                          {file.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 0.75, flexShrink: 0 }}
                        >
                          ({(file.size / 1024).toFixed(1)} KB)
                        </Typography>
                      </Box>

                      {/* Right: preview + remove */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={() => previewFile(file)}
                            sx={{ color: '#00529B' }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveNewFile(index)}
                            sx={{ color: '#d32f2f' }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* ── Reason for Edit — mandatory ── */}
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
              minWidth: 130,
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
