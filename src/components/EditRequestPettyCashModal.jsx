import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const styles = {
  uploadBox: {
    border: '2px dashed rgba(0, 82, 155, 0.3)',
    borderRadius: '8px',
    p: 2,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 82, 155, 0.05)',
      borderColor: 'rgba(0, 82, 155, 0.5)',
    },
  },
};

const EditRequestPettyCashModal = ({
  open,
  handleClose,
  request,
  onUpdate,
  signers,
}) => {
  const [formData, setFormData] = useState({
    verifier_id: '',
    expenses_csv: null,
    amount: '',
    description: '',
    comment: '',
  });

  useEffect(() => {
    if (request) {
      const expense = request.expenses?.[0] || {};
      setFormData({
        verifier_id: request.verifier?.id || '',
        expenses_csv: null,
        amount: expense.amount || '',
        description: expense.item_description || 'Replenishment',
        comment: request.comment || '',
      });
    }
  }, [request]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        const lines = csvText.split('\n').filter(line => line.trim());
        
        let total = 0;
        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',');
          const amount = parseFloat(columns[5]) || 0;
          total += amount;
        }

        setFormData({
          ...formData,
          expenses_csv: file,
          amount: total.toFixed(2),
        });
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      expenses_csv: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append('related_petty_cash_id', request.related_petty_cash?.id);
    submitData.append('verifier_id', formData.verifier_id);
    
    const expensesData = [{
      ...(request.expenses?.[0]?.id && { id: request.expenses[0].id }),
      date: new Date().toISOString().split('T')[0],
      item_description: formData.description,
      amount: formData.amount,
      currency: 'USD',
    }];

    submitData.append('expenses', JSON.stringify(expensesData));
    submitData.append('comment', formData.comment);

    if (formData.expenses_csv) {
      submitData.append('expense_document_0', formData.expenses_csv);
    }

    onUpdate(request.id, submitData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#00529B',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Edit Petty Cash Request</Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Verifier Selection */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(0, 82, 155, 0.03)',
                  borderRadius: 2,
                  border: '2px solid rgba(0, 82, 155, 0.1)',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: '#00529B',
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                >
                  Select Verifier *
                </Typography>
                <FormControl fullWidth required>
                  <InputLabel>Choose Verifier</InputLabel>
                  <Select
                    name="verifier_id"
                    value={formData.verifier_id}
                    onChange={handleInputChange}
                    label="Choose Verifier"
                  >
                    <MenuItem value="" disabled>
                      <em>Select a verifier</em>
                    </MenuItem>
                    {signers.map((signer) => (
                      <MenuItem key={signer.id} value={signer.id}>
                        {signer.firstname} {signer.lastname} - {signer.position}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* CSV Upload */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                sx={{ color: '#00529B', fontWeight: 600, mb: 1 }}
              >
                Upload New Expenses CSV (Optional)
              </Typography>
              <Box sx={styles.uploadBox}>
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="edit-csv-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="edit-csv-upload">
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <CloudUploadIcon
                      sx={{ fontSize: 40, color: '#00529B', mb: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      Click to upload new CSV
                    </Typography>
                  </Box>
                </label>
              </Box>

              {formData.expenses_csv && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: 'rgba(0, 82, 155, 0.05)',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachFileIcon
                      sx={{ mr: 1, color: '#00529B', fontSize: 20 }}
                    />
                    <Typography variant="body2">
                      {formData.expenses_csv.name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={handleRemoveFile}
                    sx={{ color: '#d32f2f' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Grid>

            {/* Amount */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Amount *"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/* Comment */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
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
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#00529B',
              '&:hover': {
                bgcolor: '#003d73',
              },
              textTransform: 'none',
            }}
          >
            Update Request
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditRequestPettyCashModal;