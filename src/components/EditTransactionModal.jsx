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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { toast } from 'react-toastify';
import { updatePettyCash } from '../features/pettyCash/pettyCashSlice';

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

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
];

const EditTransactionModal = ({
  open,
  handleClose,
  transaction,
  onSuccess,
  signers = [],
}) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.pettyCash);

  const [formData, setFormData] = useState({
    holder_id: '',
    amount: '',
    currency: 'USD',
    issue_date: '',
    notes: '',
    comment: '',
    newDocument: null,
    existingDocument: null,
  });

  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (transaction) {
      setFormData({
        holder_id: transaction.holder?.id || '',
        amount: transaction.amount || '',
        currency: transaction.currency || 'USD',
        issue_date: transaction.issue_date || '',
        notes: transaction.notes || '',
        comment: '',
        newDocument: null,
        existingDocument: transaction.supporting_document || null,
      });
      setCommentError('');
    }
  }, [transaction]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'comment' && value.trim()) setCommentError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        newDocument: file,
        existingDocument: null,
      }));
    }
  };

  const handleRemoveNewDocument = () => {
    setFormData((prev) => ({ ...prev, newDocument: null }));
  };

  const handleRemoveExistingDocument = () => {
    setFormData((prev) => ({ ...prev, existingDocument: null }));
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    if (formData.newDocument) {
      payload.append('supporting_document', formData.newDocument);
    }

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
          {/* ── Holder Section ── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Petty Cash Holder
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(0, 82, 155, 0.03)',
                borderRadius: 2,
                border: '2px solid rgba(0, 82, 155, 0.1)',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#00529B',
                  fontWeight: 600,
                  mb: 1.5,
                  fontSize: '1rem',
                }}
              >
                Select Petty Cash Holder *
              </Typography>
              <FormControl fullWidth required size="large">
                <InputLabel sx={{ fontSize: '1.1rem' }}>
                  Choose Holder
                </InputLabel>
                <Select
                  name="holder_id"
                  value={formData.holder_id}
                  onChange={handleInputChange}
                  label="Choose Holder"
                  sx={{ fontSize: '1.1rem', '& .MuiSelect-select': { py: 2 } }}
                  MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
                >
                  <MenuItem value="" disabled>
                    <em>Select a holder from the list</em>
                  </MenuItem>
                  {signers.length > 0 ? (
                    signers.map((signer) => (
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
                            {signer.position} • {signer.department} •{' '}
                            {signer.section}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={transaction?.holder?.id || ''}>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {transaction?.holder?.firstname}{' '}
                          {transaction?.holder?.lastname}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {transaction?.holder?.position} •{' '}
                          {transaction?.holder?.department}
                        </Typography>
                      </Box>
                    </MenuItem>
                  )}
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

            <Grid container spacing={3}>
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
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    placeholder="e.g., 500.00"
                  />
                </Box>
              </Grid>

              {/* Currency */}
              <Grid item xs={12} md={4}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Currency *</Typography>
                  <FormControl fullWidth required>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      label="Currency"
                    >
                      {CURRENCIES.map((curr) => (
                        <MenuItem key={curr.code} value={curr.code}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  <Typography sx={style.fieldLabel}>Issue Date *</Typography>
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

              {/* Notes */}
              <Grid item xs={12}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Notes / Purpose</Typography>
                  <TextField
                    fullWidth
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    placeholder="Describe the purpose of this petty cash issuance..."
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* ── Supporting Document Section ── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Supporting Document
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Existing server document */}
            {formData.existingDocument && !formData.newDocument && (
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

            {/* Newly selected file preview */}
            {formData.newDocument && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  mb: 2,
                  bgcolor: 'rgba(0, 82, 155, 0.05)',
                  borderRadius: 1,
                  border: '1px solid rgba(0, 82, 155, 0.2)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachFileIcon
                    sx={{ mr: 1, color: '#00529B', fontSize: 20 }}
                  />
                  <Typography variant="body2">
                    {formData.newDocument.name}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={handleRemoveNewDocument}
                  sx={{ color: '#d32f2f' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Upload area */}
            <Box sx={style.uploadBox}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="edit-transaction-file-upload"
                type="file"
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
                    {formData.existingDocument || formData.newDocument
                      ? 'Click to replace document'
                      : 'Click to upload supporting document'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 0.5 }}
                  >
                    PDF, DOC, DOCX, or image files
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
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00529B' },
                }}
              />
            </Box>
          </Paper>

          {/* ── Action Buttons ── */}
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pb: 1 }}
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
        </Box>
      </Box>
    </Modal>
  );
};

export default EditTransactionModal;
