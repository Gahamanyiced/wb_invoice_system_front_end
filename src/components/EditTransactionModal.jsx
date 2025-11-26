import { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    bgcolor: '#00529B',
    color: 'white',
    p: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    p: 3,
    overflowY: 'auto',
    flex: 1,
  },
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

const EditTransactionModal = ({ open, handleClose, transaction }) => {
  const [formData, setFormData] = useState({
    title: '',
    cm: '',
    amount: '',
    paymentDate: '',
    description: '',
    documents: [],
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        cm: transaction.cm || '',
        amount: transaction.amount || '',
        paymentDate: transaction.paymentDate || '',
        description: transaction.description || '',
        documents: transaction.documents || [],
      });
    }
  }, [transaction]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      documents: [...formData.documents, ...files],
    });
  };

  const handleRemoveFile = (index) => {
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      documents: newDocuments,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend API
    console.log('Updated transaction data:', formData);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" component="h2" fontWeight="500">
            Edit Transaction
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={style.content}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Select CM - Full width */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select CM</InputLabel>
                  <Select
                    name="cm"
                    value={formData.cm}
                    onChange={handleInputChange}
                    label="Select CM"
                  >
                    <MenuItem value="John Doe">John Doe</MenuItem>
                    <MenuItem value="Jane Smith">Jane Smith</MenuItem>
                    <MenuItem value="Bob Johnson">Bob Johnson</MenuItem>
                    {/* TODO: Replace with dynamic data from API */}
                  </Select>
                </FormControl>
              </Grid>

              {/* Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount *"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                />
              </Grid>

              {/* Payment Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Date *"
                  name="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Supporting Documents */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: '#00529B', fontWeight: 600 }}
                >
                  Supporting Documents
                </Typography>
                <Box sx={style.uploadBox}>
                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="edit-transaction-file-upload"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="edit-transaction-file-upload">
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
                        Click to upload supporting documents
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 0.5 }}
                      >
                        Multiple files allowed
                      </Typography>
                    </Box>
                  </label>
                </Box>

                {/* Display uploaded files */}
                {formData.documents.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {formData.documents.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          mb: 1,
                          bgcolor: 'rgba(0, 82, 155, 0.05)',
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachFileIcon
                            sx={{ mr: 1, color: '#00529B', fontSize: 20 }}
                          />
                          <Typography variant="body2">
                            {file.name || file}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(index)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}
                >
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
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditTransactionModal;
