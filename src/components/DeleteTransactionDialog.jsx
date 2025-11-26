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

const DeleteTransactionDialog = ({ open, handleClose, transaction }) => {
  const handleDelete = () => {
    // TODO: Integrate with backend API
    console.log('Deleting transaction:', transaction?.id);
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
          <Typography variant="h6">Delete Transaction</Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete this transaction? This action cannot
          be undone.
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
            Transaction Details:
          </Typography>
          <Typography variant="body2">
            <strong>ID:</strong> #{transaction?.id}
          </Typography>
          <Typography variant="body2">
            <strong>Title:</strong> {transaction?.title}
          </Typography>
          <Typography variant="body2">
            <strong>Amount:</strong>{' '}
            {transaction?.amount
              ? new Intl.NumberFormat('en-RW', {
                  style: 'currency',
                  currency: 'RWF',
                }).format(transaction.amount)
              : 'N/A'}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          sx={{
            color: '#666',
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          sx={{
            bgcolor: '#d32f2f',
            '&:hover': {
              bgcolor: '#b71c1c',
            },
            textTransform: 'none',
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTransactionDialog;
