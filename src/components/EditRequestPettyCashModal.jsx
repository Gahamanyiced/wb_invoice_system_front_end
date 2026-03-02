import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

// Props:
//   open, handleClose, request (full request object), onUpdate(id, FormData), signers[]

const style = {
  section: {
    mb: 2.5,
    p: 2,
    bgcolor: 'rgba(255, 152, 0, 0.03)',
    border: '1px solid rgba(255, 152, 0, 0.15)',
    borderRadius: 2,
  },
};

const EditRequestPettyCashModal = ({
  open,
  handleClose,
  request,
  onUpdate,
  signers = [],
}) => {
  const { isLoading } = useSelector((state) => state.pettyCash);

  const [verifierId, setVerifierId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  // Populate on open
  useEffect(() => {
    if (open && request) {
      setVerifierId(request.verifier?.id || '');
      setDescription(request.expenses?.[0]?.item_description || '');
      setAmount(request.total_expenses || '');
      setComment('');
      setCommentError('');
    }
  }, [open, request]);

  const handleClose_ = () => {
    setComment('');
    setCommentError('');
    handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setCommentError('Please provide a reason for this update');
      return;
    }

    const formData = new FormData();
    formData.append('verifier_id', verifierId);
    formData.append('comment', comment.trim());

    // Update first expense description + amount if changed
    if (description) formData.append('description', description);
    if (amount) formData.append('amount', amount);

    await onUpdate(request.id, formData);
  };

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose_}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {/* Header — amber to distinguish from create/view */}
      <Box
        sx={{
          bgcolor: '#FFA726',
          color: 'white',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Edit Request
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              ID #{request.id}
            </Typography>
          </Box>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose_}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            {/* Verifier */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Verifier *</InputLabel>
                <Select
                  value={verifierId}
                  onChange={(e) => setVerifierId(e.target.value)}
                  label="Verifier *"
                  MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                >
                  <MenuItem value="" disabled>
                    <em>Select verifier</em>
                  </MenuItem>
                  {signers.map((s) => (
                    <MenuItem key={s.id} value={s.id} sx={{ py: 1.25 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {s.firstname} {s.lastname}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {s.position} • {s.department}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Replenishment"
              />
            </Grid>

            {/* Amount (informational — read-only, comes from expenses) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Amount"
                value={amount}
                InputProps={{ readOnly: true }}
                helperText="Calculated from expense items"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Mandatory comment */}
            <Grid item xs={12}>
              <Box sx={style.section}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="#FFA726"
                  gutterBottom
                >
                  Reason for Update{' '}
                  <Typography component="span" color="error">
                    *
                  </Typography>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe why this request is being updated..."
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
                      borderColor: '#FFA726',
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleClose_}
            disabled={isLoading}
            sx={{ color: '#666', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : (
                <EditIcon />
              )
            }
            sx={{
              bgcolor: '#FFA726',
              '&:hover': { bgcolor: '#F57C00' },
              textTransform: 'none',
              minWidth: 140,
            }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditRequestPettyCashModal;
