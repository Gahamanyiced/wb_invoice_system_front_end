import { useState } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const AcknowledgeTransactionDialog = ({ open, handleClose, transaction }) => {
  const [comment, setComment] = useState('');

  const handleAcknowledge = () => {
    // TODO: Integrate with backend API
    console.log('Acknowledging transaction:', transaction?.id);
    console.log('Comment:', comment);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#66BB6A',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlineIcon />
          <Typography variant="h6">Acknowledge Transaction</Typography>
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
          Are you sure you want to acknowledge this transaction?
        </Typography>

        <Box
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'rgba(102, 187, 106, 0.1)',
            borderRadius: 1,
            border: '1px solid rgba(102, 187, 106, 0.3)',
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

        <TextField
          fullWidth
          label="Comment (Optional)"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add any comments or notes..."
        />
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
          onClick={handleAcknowledge}
          variant="contained"
          sx={{
            bgcolor: '#66BB6A',
            '&:hover': {
              bgcolor: '#57A05A',
            },
            textTransform: 'none',
          }}
        >
          Acknowledge
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcknowledgeTransactionDialog;
