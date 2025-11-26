import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const DeletePettyCashRequestDialog = ({ open, handleClose, request }) => {
  const handleDelete = () => {
    // TODO: Integrate with backend API
    console.log('Deleting request:', request?.id);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
          <Typography variant="h6">Delete Petty Cash Request</Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete this petty cash request? This action cannot be undone.
        </Typography>

        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            borderRadius: 1,
            border: '1px solid rgba(211, 47, 47, 0.3)',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Request Details:
          </Typography>
          <Typography variant="body2">
            <strong>ID:</strong> #{request?.id}
          </Typography>
          <Typography variant="body2">
            <strong>Transaction Title:</strong> {request?.transactionTitle}
          </Typography>
          <Typography variant="body2">
            <strong>Total Amount:</strong>{' '}
            {request?.totalAmount
              ? new Intl.NumberFormat('en-RW', {
                  style: 'currency',
                  currency: 'RWF',
                }).format(request.totalAmount)
              : 'N/A'}
          </Typography>
          <Typography variant="body2">
            <strong>Expenses:</strong> {request?.expenses?.length || 0} items
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: '#666', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          sx={{
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' },
            textTransform: 'none',
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletePettyCashRequestDialog;