import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Divider,
  Grid,
  TextField,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BlockIcon from '@mui/icons-material/Block';

// Props:
//   open, handleClose, request (full request object), onDelete(id, comment)

// Deletion is only permitted when the request is pending or rolled back.
const ALLOWED_STATUSES = ['pending', 'rollback'];

const formatStatus = (status) => {
  if (!status) return 'N/A';
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const DeleteRequestPettyCashDialog = ({
  open,
  handleClose,
  request,
  onDelete,
}) => {
  const { isLoading } = useSelector((state) => state.pettyCash);

  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setLoggedInUser(JSON.parse(userStr));
  }, [open]);

  // ── Status check ──────────────────────────────────────────────────────────
  const currentStatus = request?.status;
  const isStatusAllowed = ALLOWED_STATUSES.includes(currentStatus);

  // Show the full form only when status allows deletion
  const canDelete = isStatusAllowed;

  const formatAmount = (a) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(a || 0));

  const handleConfirm = () => {
    if (!isStatusAllowed) {
      return;
    }
    if (!comment.trim()) {
      setCommentError('Please provide a reason for deletion');
      return;
    }
    onDelete(request.id, comment.trim());
  };

  const handleClose_ = () => {
    setComment('');
    setCommentError('');
    handleClose();
  };

  if (!request) return null;

  return (
    <Dialog open={open} onClose={handleClose_} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#EF5350',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 1.5,
        }}
      >
        <DeleteOutlineIcon />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Delete Request
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            ID #{request.id}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* ── BLOCK: Status not allowed ── */}
        {!isStatusAllowed && (
          <Alert severity="error" icon={<BlockIcon />} sx={{ mb: 2 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>
              Cannot Delete — {formatStatus(currentStatus)}
            </AlertTitle>
            Deletion is only permitted when the request status is{' '}
            <strong>Pending</strong> or <strong>Rolled Back</strong>.
            {currentStatus === 'approved' &&
              ' Approved requests cannot be deleted.'}
            {currentStatus === 'denied' &&
              ' Denied requests cannot be deleted.'}
            {currentStatus === 'verified' &&
              ' Verified requests cannot be deleted.'}
          </Alert>
        )}

        {/* ── ALLOWED: show full delete form ── */}
        {canDelete && (
          <>
            {/* Status-specific info banner */}
            {currentStatus === 'rollback' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This request has been <strong>rolled back</strong>. Deletion is
                permitted.
              </Alert>
            )}
            {currentStatus === 'pending' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This request is currently <strong>pending approval</strong>.
                Deleting it will remove it from the approval queue.
              </Alert>
            )}

            {/* Cannot be undone warning */}
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle sx={{ fontWeight: 600 }}>
                This cannot be undone
              </AlertTitle>
              The request and all its associated expense items will be
              permanently deleted.
            </Alert>

            {/* Request details */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(239, 83, 80, 0.04)',
                borderRadius: 2,
                border: '1px solid rgba(239, 83, 80, 0.15)',
                mb: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="#EF5350"
                gutterBottom
              >
                Request to be deleted:
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Request ID
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    #{request.id}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Status
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatStatus(currentStatus)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Total Amount
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {request.total_expenses != null
                      ? `${formatAmount(request.total_expenses)} ${request.currency || ''}`
                      : 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Created At
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {request.created_at
                      ? new Date(request.created_at).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>

                {/* Expense items preview */}
                {request.expenses?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Expense Items
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.75,
                        p: 1,
                        bgcolor: 'white',
                        borderRadius: 1,
                        maxHeight: 120,
                        overflowY: 'auto',
                        border: '1px solid rgba(239, 83, 80, 0.1)',
                      }}
                    >
                      {request.expenses.map((expense, i) => (
                        <Typography
                          key={expense.id || i}
                          variant="caption"
                          sx={{ display: 'block', mb: 0.4 }}
                        >
                          {i + 1}. {expense.item_description} —{' '}
                          {formatAmount(expense.amount)} {expense.currency}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Secondary warning */}
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'rgba(255, 152, 0, 0.05)',
                border: '1px solid rgba(255, 152, 0, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <WarningAmberIcon
                sx={{ color: '#FF9800', fontSize: 18, mt: 0.2 }}
              />
              <Typography variant="caption" color="text.secondary">
                Deleting this request may affect the remaining balance of the
                related petty cash transaction.
              </Typography>
            </Box>

            {/* Mandatory comment */}
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(239, 83, 80, 0.03)',
                border: '1px solid rgba(239, 83, 80, 0.2)',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: '#EF5350', mb: 1 }}
              >
                Reason for Deletion{' '}
                <Typography component="span" color="error">
                  *
                </Typography>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Describe why this request is being deleted..."
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setCommentError('');
                }}
                error={!!commentError}
                helperText={commentError}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#EF5350',
                  },
                }}
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={handleClose_}
          disabled={isLoading}
          variant="outlined"
          sx={{
            color: '#666',
            borderColor: '#ccc',
            textTransform: 'none',
            '&:hover': { borderColor: '#999' },
          }}
        >
          Cancel
        </Button>
        {/* Delete button only visible when status allows deletion */}
        {canDelete && (
          <Button
            onClick={handleConfirm}
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
              bgcolor: '#EF5350',
              '&:hover': { bgcolor: '#d32f2f' },
              textTransform: 'none',
              minWidth: 140,
            }}
          >
            {isLoading ? 'Deleting...' : 'Delete Request'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRequestPettyCashDialog;
