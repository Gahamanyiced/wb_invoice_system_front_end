import { useState, useEffect } from 'react';

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
  Alert,
  AlertTitle,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BlockIcon from '@mui/icons-material/Block';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import { toast } from 'react-toastify';

const DeleteTransactionDialog = ({
  open,
  handleClose,
  transaction,
  onDelete, // onDelete(id, comment) — parent owns dispatch + loading
  isLoading = false,
}) => {
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setLoggedInUser(JSON.parse(userStr));
  }, [open]);

  // ── Permission & status rules ─────────────────────────────────────────────
  // Only the issuer can delete.
  const isIssuer = loggedInUser?.id === transaction?.issued_by?.id;

  // Deletion is only permitted when the transaction is pending_acknowledgment
  // or has been rolled back (status: 'rollback'). Active and exhausted transactions cannot be deleted.
  const ALLOWED_STATUSES = ['pending_acknowledgment', 'rollback'];
  const currentStatus = transaction?.status;
  const isStatusAllowed = ALLOWED_STATUSES.includes(currentStatus);

  // Show the full form only when both conditions are met
  const canDelete = isIssuer && isStatusAllowed;

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCancel = () => {
    setComment('');
    setCommentError('');
    handleClose();
  };

  const handleConfirmDelete = async () => {
    // Double-check permission + status at submit time (guard against stale state)
    if (!isIssuer) {
      toast.error('Only the person who issued this transaction can delete it.');
      return;
    }
    if (!isStatusAllowed) {
      toast.error('This transaction cannot be deleted in its current status.');
      return;
    }
    if (!comment.trim()) {
      setCommentError('A comment is required before deleting.');
      return;
    }
    const c = comment.trim();
    setComment('');
    setCommentError('');
    await onDelete(transaction.id, c);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#d32f2f',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteOutlineIcon />
          <Typography variant="h6">Delete Transaction</Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCancel}
          size="small"
          disabled={isLoading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* ── BLOCK 1: Not the issuer ── */}
        {!isIssuer && (
          <Alert severity="error" icon={<LockPersonIcon />} sx={{ mb: 2 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>Permission Denied</AlertTitle>
            Only{' '}
            <strong>
              {transaction?.issued_by?.firstname}{' '}
              {transaction?.issued_by?.lastname}
            </strong>{' '}
            ({transaction?.issued_by?.position || 'the issuer'}) can delete this
            transaction.
          </Alert>
        )}

        {/* ── BLOCK 2: Status not allowed ── */}
        {isIssuer && !isStatusAllowed && (
          <Alert severity="error" icon={<BlockIcon />} sx={{ mb: 2 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>
              Cannot Delete —{' '}
              {currentStatus === 'active' && 'Transaction is Active'}
              {currentStatus === 'exhausted' && 'Transaction is Exhausted'}
              {!['active', 'exhausted'].includes(currentStatus) &&
                formatStatus(currentStatus)}
            </AlertTitle>
            Deletion is only permitted when the transaction status is{' '}
            <strong>Pending Acknowledgment</strong> or{' '}
            <strong>Rolled Back</strong>.
            {currentStatus === 'active' &&
              ' Please roll back the transaction first before deleting.'}
            {currentStatus === 'exhausted' &&
              ' Exhausted transactions cannot be deleted.'}
          </Alert>
        )}

        {/* ── ALLOWED: show full delete form ── */}
        {canDelete && (
          <>
            {/* Status-specific info banner */}
            {currentStatus === 'rollback' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This transaction has been <strong>rolled back</strong>. Deletion
                is permitted.
              </Alert>
            )}
            {currentStatus === 'pending_acknowledgment' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This transaction is <strong>pending acknowledgment</strong>.
                Deleting it will cancel the acknowledgment process.
              </Alert>
            )}

            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to delete this transaction? This action{' '}
              <strong>cannot be undone</strong>.
            </Typography>

            {/* Transaction details */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(211, 47, 47, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(211, 47, 47, 0.2)',
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="#d32f2f"
                gutterBottom
              >
                Transaction to be deleted:
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Holder
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction?.holder?.firstname}{' '}
                    {transaction?.holder?.lastname}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Position
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction?.holder?.position || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Amount Issued
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatAmount(transaction?.amount)} {transaction?.currency}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Remaining Amount
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatAmount(transaction?.remaining_amount)}{' '}
                    {transaction?.currency}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Issue Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction?.issue_date || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatStatus(currentStatus)}
                  </Typography>
                </Grid>

                {/* Issued By */}
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Issued By
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction?.issued_by?.firstname}{' '}
                    {transaction?.issued_by?.lastname}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Issuer Position
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction?.issued_by?.position || 'N/A'}
                  </Typography>
                </Grid>

                {transaction?.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {transaction.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Impact warning */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'rgba(211, 47, 47, 0.04)',
                borderRadius: 1,
                border: '1px solid rgba(211, 47, 47, 0.15)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <WarningAmberIcon
                sx={{ color: '#d32f2f', fontSize: 20, mt: 0.3 }}
              />
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="#d32f2f"
                  gutterBottom
                >
                  Impact of Deletion:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="ul"
                  sx={{ pl: 2, m: 0 }}
                >
                  <li>All associated expense records will be removed</li>
                  <li>Related petty cash requests will be affected</li>
                  <li>
                    This transaction will be permanently removed from the system
                  </li>
                </Typography>
              </Box>
            </Box>

            {/* Comment Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Reason for Deletion <span style={{ color: '#d32f2f' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Provide a reason for deleting this transaction..."
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (e.target.value.trim()) setCommentError('');
                }}
                error={!!commentError}
                helperText={commentError}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#d32f2f' },
                  },
                }}
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          onClick={handleCancel}
          disabled={isLoading}
          sx={{ color: '#666', textTransform: 'none' }}
        >
          Cancel
        </Button>
        {/* Delete button only visible when both permission and status allow it */}
        {canDelete && (
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : (
                <DeleteOutlineIcon />
              )
            }
            sx={{
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#b71c1c' },
              textTransform: 'none',
              minWidth: 130,
            }}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTransactionDialog;
