import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Grid,
  Paper,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  AlertTitle,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import BlockIcon from '@mui/icons-material/Block';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { toast } from 'react-toastify';
import { updatePettyCash } from '../features/pettyCash/pettyCashSlice';
import PETTY_CASH_CURRENCIES from '../constants/pettyCashCurrencies';

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    bgcolor: '#00529B',
    color: 'white',
    p: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    p: 3,
    overflowY: 'auto',
    flex: 1,
  },
  section: {
    mb: 3,
    p: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
    borderRadius: 1,
  },
  fieldContainer: {
    mb: 2,
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

// Statuses that allow editing
const EDIT_ALLOWED_STATUSES = ['rollback', 'pending_acknowledgment'];

const formatStatus = (status) => {
  if (!status) return 'N/A';
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ── File preview helper ───────────────────────────────────────────────────────
const previewFile = (file) => {
  const url = URL.createObjectURL(file);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

const EditTransactionModal = ({
  open,
  handleClose,
  transaction,
  onSuccess,
  signers = [],
}) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.pettyCash);

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [formData, setFormData] = useState({
    holder_id: '',
    amount: '',
    currency: 'USD',
    issue_date: '',
    notes: '',
    comment: '',
    newDocuments: [], // changed: array of newly selected File objects
    existingDocument: null, // existing server URL (single, unchanged)
  });

  const [commentError, setCommentError] = useState('');

  // Resolve logged-in user whenever modal opens
  useEffect(() => {
    if (open) {
      const userStr = localStorage.getItem('user');
      if (userStr) setLoggedInUser(JSON.parse(userStr));
    }
  }, [open]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        holder_id: transaction.holder?.id || '',
        amount: transaction.amount || '',
        currency: transaction.currency || 'USD',
        issue_date: transaction.issue_date || '',
        notes: transaction.notes || '',
        comment: '',
        newDocuments: [], // changed: reset to empty array
        existingDocument: transaction.documents?.[0]?.document_url || null,
      });
      setCommentError('');
    }
  }, [transaction]);

  // ── Permission & status checks ────────────────────────────────────────────
  const isIssuer = loggedInUser?.id === transaction?.issued_by?.id;
  const isStatusAllowed = EDIT_ALLOWED_STATUSES.includes(transaction?.status);
  const canEdit = isIssuer && isStatusAllowed;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'comment' && value.trim()) setCommentError('');
  };

  // changed: append newly selected files, skip duplicates by filename
  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => {
      const existingNames = new Set(prev.newDocuments.map((f) => f.name));
      const unique = newFiles.filter((f) => !existingNames.has(f.name));
      return { ...prev, newDocuments: [...prev.newDocuments, ...unique] };
    });
    // reset so the same file can be re-added after removal
    e.target.value = '';
  };

  // changed: remove a single new file by index
  const handleRemoveNewDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      newDocuments: prev.newDocuments.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveExistingDocument = () => {
    setFormData((prev) => ({ ...prev, existingDocument: null }));
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: must be the issuer
    if (!isIssuer) {
      toast.error('Only the person who issued this transaction can edit it.');
      return;
    }

    // Guard: status must be rollback or pending_acknowledgment
    if (!isStatusAllowed) {
      toast.error(
        'This transaction can only be edited when its status is Rolled Back or Pending Acknowledgment.',
      );
      return;
    }

    // Validate comment
    if (!formData.comment.trim()) {
      setCommentError('A comment is required to save changes.');
      return;
    }

    const payload = new FormData();
    payload.append('holder_id', formData.holder_id);
    payload.append('amount', formData.amount);
    payload.append('currency', formData.currency);
    payload.append('issue_date', formData.issue_date);
    payload.append('notes', formData.notes);
    payload.append('comment', formData.comment.trim());

    // changed: append each new file under the same key
    formData.newDocuments.forEach((file) => {
      payload.append('supporting_documents', file);
    });

    const result = await dispatch(
      updatePettyCash({ id: transaction.id, formData: payload }),
    );

    if (updatePettyCash.fulfilled.match(result)) {
      toast.success('Transaction updated successfully.');
      handleClose();
      if (onSuccess) onSuccess();
    } else {
      toast.error(result.payload || 'Failed to update transaction.');
    }
  };

  return (
    <Modal open={open} onClose={handleCancel}>
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" fontWeight={600}>
            Edit Transaction
          </Typography>
          <IconButton
            onClick={handleCancel}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box sx={style.content} component="form" onSubmit={handleSubmit}>
          {/* ── BLOCK 1: Not the issuer ── */}
          {!isIssuer && loggedInUser && (
            <Alert severity="error" icon={<LockPersonIcon />} sx={{ mb: 3 }}>
              <AlertTitle sx={{ fontWeight: 700 }}>
                Permission Denied
              </AlertTitle>
              Only{' '}
              <strong>
                {transaction?.issued_by?.firstname}{' '}
                {transaction?.issued_by?.lastname}
              </strong>{' '}
              ({transaction?.issued_by?.position || 'the issuer'}) can edit this
              transaction.
            </Alert>
          )}

          {/* ── BLOCK 2: Issuer but wrong status ── */}
          {isIssuer && !isStatusAllowed && (
            <Alert severity="error" icon={<BlockIcon />} sx={{ mb: 3 }}>
              <AlertTitle sx={{ fontWeight: 700 }}>
                Cannot Edit — {formatStatus(transaction?.status)}
              </AlertTitle>
              Editing is only permitted when the transaction status is{' '}
              <strong>Rolled Back</strong> or{' '}
              <strong>Pending Acknowledgment</strong>.
              {transaction?.status === 'active' &&
                ' Please roll back the transaction first before editing.'}
              {transaction?.status === 'exhausted' &&
                ' Exhausted transactions cannot be edited.'}
            </Alert>
          )}

          {/* ── ALLOWED: show full edit form ── */}
          {canEdit && (
            <>
              {/* Status-specific info banner */}
              {transaction?.status === 'rollback' && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  This transaction has been <strong>rolled back</strong>. You
                  may edit and resubmit it.
                </Alert>
              )}
              {transaction?.status === 'pending_acknowledgment' && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  This transaction is <strong>pending acknowledgment</strong>.
                  Editing it may affect the acknowledgment process.
                </Alert>
              )}

              {/* ── Custodian Section ── */}
              <Paper elevation={0} sx={style.section}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="#00529B"
                  gutterBottom
                >
                  Petty Cash Custodian
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Custodian *</Typography>
                  <FormControl fullWidth required>
                    <InputLabel>Choose Custodian</InputLabel>
                    <Select
                      name="holder_id"
                      value={formData.holder_id}
                      onChange={handleInputChange}
                      label="Choose Custodian"
                      MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select a custodian</em>
                      </MenuItem>
                      {signers.map((signer) => (
                        <MenuItem
                          key={signer.id}
                          value={signer.id}
                          sx={{ py: 1.5 }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {signer.firstname} {signer.lastname}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {signer.position} • {signer.department}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Paper>

              {/* ── Transaction Details Section ── */}
              <Paper elevation={0} sx={style.section}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="#00529B"
                  gutterBottom
                >
                  Transaction Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {/* Amount */}
                  <Grid item xs={12} md={4}>
                    <Box sx={style.fieldContainer}>
                      <Typography sx={style.fieldLabel}>Amount *</Typography>
                      <TextField
                        fullWidth
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        inputProps={{ min: 0, step: '0.01' }}
                      />
                    </Box>
                  </Grid>

                  {/* Currency */}
                  <Grid item xs={12} md={4}>
                    <Box sx={style.fieldContainer}>
                      <Typography sx={style.fieldLabel}>Currency *</Typography>
                      <FormControl fullWidth required>
                        <Select
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                        >
                          {PETTY_CASH_CURRENCIES.map((curr) => (
                            <MenuItem key={curr.code} value={curr.code}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {curr.symbol}
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {curr.code}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ ml: 1 }}
                                >
                                  - {curr.name}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>

                  {/* Issue Date */}
                  <Grid item xs={12} md={4}>
                    <Box sx={style.fieldContainer}>
                      <Typography sx={style.fieldLabel}>
                        Issue Date *
                      </Typography>
                      <TextField
                        fullWidth
                        name="issue_date"
                        type="date"
                        value={formData.issue_date}
                        onChange={handleInputChange}
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Notes */}
                <Box sx={{ ...style.fieldContainer, mt: 2 }}>
                  <Typography sx={style.fieldLabel}>Notes / Purpose</Typography>
                  <TextField
                    fullWidth
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    placeholder="Describe the purpose of this petty cash issuance..."
                  />
                </Box>
              </Paper>

              {/* ── Supporting Documents Section — changed to support multiple files ── */}
              <Paper elevation={0} sx={style.section}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="#00529B"
                  gutterBottom
                >
                  Supporting Documents
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Existing server document */}
                {formData.existingDocument && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      mb: 2,
                      bgcolor: 'rgba(0, 82, 155, 0.05)',
                      borderRadius: 1,
                      border: '1px solid rgba(0, 82, 155, 0.2)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        window.open(formData.existingDocument, '_blank')
                      }
                    >
                      <AttachFileIcon sx={{ mr: 1, color: '#00529B' }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {formData.existingDocument.split('/').pop()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#00529B', fontWeight: 500, mr: 1 }}
                      >
                        View Document
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={handleRemoveExistingDocument}
                      sx={{ color: '#d32f2f' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {/* Newly selected files list */}
                {formData.newDocuments.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {formData.newDocuments.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          mb: 1,
                          bgcolor: 'rgba(0, 82, 155, 0.05)',
                          borderRadius: 1,
                          border: '1px solid rgba(0, 82, 155, 0.2)',
                        }}
                      >
                        {/* ── left: icon + name + size ── */}
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
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                            {file.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1, flexShrink: 0 }}
                          >
                            ({(file.size / 1024).toFixed(1)} KB)
                          </Typography>
                        </Box>
                        {/* ── right: preview + remove ── */}
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
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveNewDocument(index)}
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

                {/* Upload area */}
                <Box sx={style.uploadBox}>
                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="edit-transaction-file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="edit-transaction-file-upload">
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <CloudUploadIcon
                        sx={{ fontSize: 40, color: '#00529B', mb: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {formData.existingDocument ||
                        formData.newDocuments.length > 0
                          ? 'Click to add more documents'
                          : 'Click to upload supporting documents'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 0.5 }}
                      >
                        PDF, DOC, DOCX, or image files — multiple files allowed
                      </Typography>
                    </Box>
                  </label>
                </Box>
              </Paper>

              {/* ── Comment Section ── */}
              <Paper elevation={0} sx={style.section}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="#00529B"
                  gutterBottom
                >
                  Reason for Edit
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>
                    Comment <span style={{ color: '#d32f2f' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    required
                    placeholder="Explain the reason for this edit..."
                    error={!!commentError}
                    helperText={commentError}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#00529B' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#00529B',
                      },
                    }}
                  />
                </Box>
              </Paper>

              {/* ── Action Buttons ── */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  pb: 1,
                }}
              >
                <Button
                  onClick={handleCancel}
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
                    ) : (
                      <SaveOutlinedIcon />
                    )
                  }
                  sx={{
                    bgcolor: '#00529B',
                    '&:hover': { bgcolor: '#003d73' },
                    textTransform: 'none',
                    minWidth: 140,
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </>
          )}

          {/* ── Blocked: show only Close button ── */}
          {!canEdit && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 1 }}>
              <Button
                onClick={handleCancel}
                sx={{ color: '#666', textTransform: 'none' }}
              >
                Close
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default EditTransactionModal;
