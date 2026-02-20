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
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import UndoIcon from '@mui/icons-material/Undo';

const RollbackTransactionDialog = ({
  open,
  handleClose,
  transaction,
  onRollback,
}) => {
  const handleConfirmRollback = () => {
    onRollback(transaction.id);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#FF9800',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <UndoIcon />
        <Typography variant="h6">Rollback Transaction</Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Warning Alert */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Caution</AlertTitle>
          This action will reset the transaction to its initial state. Any
          related requests and changes will be affected.
        </Alert>

        {/* Transaction Details */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(255, 152, 0, 0.05)',
            borderRadius: 2,
            border: '1px solid rgba(255, 152, 0, 0.2)',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2, color: '#FF9800' }}
          >
            Transaction to be rolled back:
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
                ${formatAmount(transaction?.amount)} {transaction?.currency}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Remaining Amount
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                ${formatAmount(transaction?.remaining_amount)}{' '}
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
                {formatStatus(transaction?.status)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Acknowledged
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {transaction?.is_acknowledged ? 'Yes' : 'No'}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {transaction?.created_at
                  ? new Date(transaction.created_at).toLocaleDateString()
                  : 'N/A'}
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

        {/* Impact Warning */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'rgba(239, 83, 80, 0.05)',
            borderRadius: 1,
            border: '1px solid rgba(239, 83, 80, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <WarningAmberIcon sx={{ color: '#EF5350', fontSize: 20, mt: 0.5 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} color="#EF5350" gutterBottom>
              Impact of Rollback:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
              <li>Transaction status will be reset to initial state</li>
              <li>Acknowledgment will be cleared (if applicable)</li>
              <li>Related expense requests may be affected</li>
              <li>Transaction history will be preserved</li>
              <li>This action can only be undone by recreating the transaction</li>
            </Typography>
          </Box>
        </Box>

        {/* Confirmation Message */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: 'rgba(0, 0, 0, 0.03)',
            borderRadius: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            Are you sure you want to proceed with the rollback?
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            color: '#666',
            borderColor: '#666',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#333',
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmRollback}
          variant="contained"
          sx={{
            bgcolor: '#FF9800',
            '&:hover': {
              bgcolor: '#F57C00',
            },
            textTransform: 'none',
          }}
          startIcon={<UndoIcon />}
        >
          Rollback Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RollbackTransactionDialog;