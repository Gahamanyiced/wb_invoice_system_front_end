import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';

const TrackAndSignPettyCashDialog = ({ open, handleClose, request }) => {
  // Sample tracking data - replace with actual data from API
  const [trackingSteps] = useState([
    { label: 'Submitted', status: 'completed', user: 'John Doe', date: '2024-11-18 10:30' },
    { label: 'Review', status: 'completed', user: 'Jane Smith', date: '2024-11-19 14:20' },
    { label: 'Approval', status: 'pending', user: 'Pending', date: '-' },
    { label: 'Signed', status: 'pending', user: 'Pending', date: '-' },
  ]);

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#66BB6A' }} />;
      case 'pending':
        return <PendingIcon sx={{ color: '#FFA726' }} />;
      case 'denied':
        return <CancelIcon sx={{ color: '#EF5350' }} />;
      default:
        return <PendingIcon sx={{ color: '#9E9E9E' }} />;
    }
  };

  const handleSign = () => {
    // TODO: Integrate with backend API
    console.log('Signing request:', request?.id);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#FFA726',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrackChangesIcon />
          <Typography variant="h6">Track & Sign Request</Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Request Details */}
        <Box sx={{ p: 2, mb: 3, bgcolor: 'rgba(255, 167, 38, 0.1)', borderRadius: 1, border: '1px solid rgba(255, 167, 38, 0.3)' }}>
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
              ? new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(request.totalAmount)
              : 'N/A'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tracking Steps */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#00529B' }}>
          Tracking History
        </Typography>

        <Box sx={{ mb: 3 }}>
          {trackingSteps.map((step, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ mt: 0.5 }}>{getStepIcon(step.status)}</Box>
              <Box sx={{ ml: 2, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {step.label}
                  </Typography>
                  <Chip
                    label={step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    size="small"
                    sx={{
                      bgcolor: step.status === 'completed' ? '#66BB6A' : step.status === 'pending' ? '#FFA726' : '#EF5350',
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {step.user}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {step.date}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Sign Action */}
        <Box sx={{ p: 2, bgcolor: 'rgba(0, 82, 155, 0.05)', borderRadius: 1 }}>
          <Typography variant="body2" gutterBottom>
            By clicking "Sign Request", you are approving and digitally signing this petty cash request.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: '#666', textTransform: 'none' }}>
          Close
        </Button>
        <Button
          onClick={handleSign}
          variant="contained"
          sx={{
            bgcolor: '#00529B',
            '&:hover': { bgcolor: '#003d73' },
            textTransform: 'none',
          }}
        >
          Sign Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrackAndSignPettyCashDialog;