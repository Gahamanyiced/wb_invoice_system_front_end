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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const DeleteRequestPettyCashDialog = ({
  open,
  handleClose,
  request,
  onDelete,
}) => {
  const handleConfirmDelete = () => {
    onDelete(request.id);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#EF5350',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <DeleteOutlineIcon />
        <Typography variant="h6">Delete Petty Cash Request</Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Warning Alert */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Warning</AlertTitle>
          This action cannot be undone. The request will be permanently deleted
          from the system.
        </Alert>

        {/* Request Details */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(239, 83, 80, 0.05)',
            borderRadius: 2,
            border: '1px solid rgba(239, 83, 80, 0.2)',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2, color: '#EF5350' }}
          >
            Request to be deleted:
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Requester
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {request?.requester?.firstname} {request?.requester?.lastname}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Verifier
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {request?.verifier?.firstname} {request?.verifier?.lastname}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                ${formatAmount(request?.total_expenses)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {request?.expenses?.[0]?.item_description || 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {request?.status
                  ? request.status
                      .replace(/_/g, ' ')
                      .split(' ')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(' ')
                  : 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {request?.created_at
                  ? new Date(request.created_at).toLocaleDateString()
                  : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Additional Warning */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'rgba(255, 152, 0, 0.05)',
            borderRadius: 1,
            border: '1px solid rgba(255, 152, 0, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <WarningAmberIcon sx={{ color: '#FF9800', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            This will remove the petty cash request and its associated
            documentation.
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
          onClick={handleConfirmDelete}
          variant="contained"
          sx={{
            bgcolor: '#EF5350',
            '&:hover': {
              bgcolor: '#d32f2f',
            },
            textTransform: 'none',
          }}
          startIcon={<DeleteOutlineIcon />}
        >
          Delete Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRequestPettyCashDialog;
