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
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import http from '../http-common';

const styles = {
  section: {
    mb: 3,
    p: 2,
    bgcolor: 'rgba(102, 187, 106, 0.03)',
    borderRadius: 1,
  },
};

const AcknowledgeTransactionDialog = ({
  open,
  handleClose,
  transaction,
  onAcknowledge,
}) => {
  const [comment, setComment] = useState('');
  const [expenseCreatorId, setExpenseCreatorId] = useState('');
  const [expenseCreators, setExpenseCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(false);

  // Fetch eligible expense creators whenever the dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchExpenseCreators = async () => {
      setLoadingCreators(true);
      try {
        // Fetch both signer and signer_admin roles in parallel
        const [signerRes, signerAdminRes] = await Promise.all([
          http.get('/auth/user-list/', {
            params: {
              is_approved: true,
              is_petty_cash_user: true,
              is_expense_creator: true,
              role: 'signer',
            },
          }),
          http.get('/auth/user-list/', {
            params: {
              is_approved: true,
              is_petty_cash_user: true,
              is_expense_creator: true,
              role: 'signer_admin',
            },
          }),
        ]);

        const signerResults = signerRes.data?.results ?? signerRes.data ?? [];
        const signerAdminResults =
          signerAdminRes.data?.results ?? signerAdminRes.data ?? [];

        // Merge and deduplicate by user id
        const merged = [...signerResults, ...signerAdminResults];
        const unique = merged.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id),
        );

        setExpenseCreators(unique);
      } catch (err) {
        console.error('Failed to fetch expense creators:', err);
        setExpenseCreators([]);
      } finally {
        setLoadingCreators(false);
      }
    };

    fetchExpenseCreators();
  }, [open]);

  const handleAcknowledge = () => {
    if (onAcknowledge) {
      onAcknowledge(transaction?.id, comment, expenseCreatorId);
    }
    setComment('');
    setExpenseCreatorId('');
  };

  const handleCancel = () => {
    setComment('');
    setExpenseCreatorId('');
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#66BB6A',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Acknowledge Petty Cash
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCancel}
          size="small"
          sx={{
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3, px: 3 }}>
        {/* Confirmation Message */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 1.5,
              color: '#333',
              fontWeight: 500,
            }}
          >
            Confirm Receipt
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            By acknowledging, you confirm that you have received the petty cash
            amount in full and take responsibility for its proper use according
            to company policies.
          </Typography>
        </Box>

        {/* Info Alert */}
        <Alert
          severity="info"
          icon={<CheckCircleOutlineIcon />}
          sx={{
            mb: 3,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            Important Reminders:
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            • Keep all receipts and documentation
            <br />
            • Submit expense reports within the required timeframe
            <br />• Return any unused funds promptly
          </Typography>
        </Alert>

        {/* Expense Creator Section */}
        <Paper elevation={0} sx={styles.section}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#66BB6A"
            gutterBottom
          >
            Expense Creator
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              p: 2,
              bgcolor: 'rgba(102, 187, 106, 0.04)',
              borderRadius: 2,
              border: '2px solid rgba(102, 187, 106, 0.2)',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: '#57A05A',
                fontWeight: 600,
                mb: 1.5,
                fontSize: '1rem',
              }}
            >
              Select Creator *
            </Typography>
            <FormControl fullWidth required size="large">
              <InputLabel sx={{ fontSize: '1.1rem' }}>
                Choose Creator
              </InputLabel>
              <Select
                value={expenseCreatorId}
                onChange={(e) => setExpenseCreatorId(e.target.value)}
                label="Choose Creator"
                disabled={loadingCreators}
                sx={{
                  fontSize: '1.1rem',
                  '& .MuiSelect-select': { py: 2 },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#66BB6A',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#66BB6A',
                  },
                }}
                MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
              >
                <MenuItem value="" disabled>
                  {loadingCreators ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={14} />
                      <em>Loading creators...</em>
                    </Box>
                  ) : (
                    <em>Select a creator from the list</em>
                  )}
                </MenuItem>
                {!loadingCreators && expenseCreators.length === 0 && (
                  <MenuItem value="" disabled>
                    <em>No eligible creators found</em>
                  </MenuItem>
                )}
                {expenseCreators.map((creator) => (
                  <MenuItem
                    key={creator.id}
                    value={creator.id}
                    sx={{ py: 1.5 }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {creator.firstname} {creator.lastname}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {creator.position} • {creator.department} •{' '}
                        {creator.section}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Comments Field */}
        <TextField
          fullWidth
          label="Notes or Comments (Optional)"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add any notes about receiving this petty cash..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#66BB6A',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#66BB6A',
              },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{
            color: '#666',
            borderColor: '#ddd',
            textTransform: 'none',
            px: 3,
            '&:hover': {
              borderColor: '#999',
              bgcolor: 'rgba(0, 0, 0, 0.02)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAcknowledge}
          variant="contained"
          startIcon={<CheckCircleOutlineIcon />}
          disabled={!expenseCreatorId || loadingCreators}
          sx={{
            bgcolor: '#66BB6A',
            '&:hover': {
              bgcolor: '#57A05A',
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(102, 187, 106, 0.4)',
              color: 'white',
            },
            textTransform: 'none',
            px: 3,
            fontWeight: 600,
          }}
        >
          Confirm & Acknowledge
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcknowledgeTransactionDialog;
