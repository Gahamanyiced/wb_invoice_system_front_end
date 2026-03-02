import { useState } from 'react';
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

// Props:
//   open, handleClose, request (full request object), onDelete(id, comment)

const DeleteRequestPettyCashDialog = ({
  open,
  handleClose,
  request,
  onDelete,
}) => {
  const { isLoading } = useSelector((state) => state.pettyCash);

  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const formatAmount = (a) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(a || 0));

  const handleConfirm = () => {
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
        {/* Warning */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>
            This cannot be undone
          </AlertTitle>
          The request and all its associated expense items will be permanently
          deleted.
        </Alert>

        {/* Request summary */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(239, 83, 80, 0.04)',
            borderRadius: 2,
            border: '1px solid rgba(239, 83, 80, 0.2)',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 1.5, color: '#EF5350' }}
          >
            Request to be deleted
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Requester
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {request.requester?.firstname} {request.requester?.lastname}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Verifier
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {request.verifier?.firstname} {request.verifier?.lastname}
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
              <Typography variant="body2" fontWeight={700} color="#EF5350">
                {formatAmount(request.total_expenses)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Expenses
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {request.expenses?.length || 0} item(s)
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
                {request.status
                  ?.replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase()) || 'N/A'}
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
          <WarningAmberIcon sx={{ color: '#FF9800', fontSize: 18, mt: 0.2 }} />
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
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRequestPettyCashDialog;
