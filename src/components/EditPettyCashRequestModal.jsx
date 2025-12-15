import { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '80%', md: '75%', lg: '70%' },
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
  expenseCard: {
    border: '1px solid rgba(0, 82, 155, 0.2)',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
  },
};

const EditPettyCashRequestModal = ({ open, handleClose, request }) => {
  const [formData, setFormData] = useState({
    transactionTitle: '',
    expenses: [{ amount: '', date: '', documents: [] }],
  });

  useEffect(() => {
    if (request) {
      setFormData({
        transactionTitle: request.transactionTitle || '',
        expenses: request.expenses || [{ amount: '', date: '', documents: [] }],
      });
    }
  }, [request]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...formData.expenses];
    newExpenses[index][field] = value;
    setFormData({ ...formData, expenses: newExpenses });
  };

  const handleAddExpense = () => {
    setFormData({
      ...formData,
      expenses: [...formData.expenses, { amount: '', date: '', documents: [] }],
    });
  };

  const handleRemoveExpense = (index) => {
    if (formData.expenses.length > 1) {
      const newExpenses = formData.expenses.filter((_, i) => i !== index);
      setFormData({ ...formData, expenses: newExpenses });
    }
  };

  const handleFileUpload = (expenseIndex, e) => {
    const files = Array.from(e.target.files);
    const newExpenses = [...formData.expenses];
    newExpenses[expenseIndex].documents = [
      ...newExpenses[expenseIndex].documents,
      ...files,
    ];
    setFormData({ ...formData, expenses: newExpenses });
  };

  const handleRemoveFile = (expenseIndex, fileIndex) => {
    const newExpenses = [...formData.expenses];
    newExpenses[expenseIndex].documents = newExpenses[
      expenseIndex
    ].documents.filter((_, i) => i !== fileIndex);
    setFormData({ ...formData, expenses: newExpenses });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated request data:', formData);
    handleClose();
  };

  const calculateTotalAmount = () => {
    return formData.expenses.reduce(
      (sum, expense) => sum + (parseFloat(expense.amount) || 0),
      0
    );
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style.modal}>
        <Box sx={style.header}>
          <Typography variant="h6">Edit Petty Cash Request</Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={style.content}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Transaction Title *"
                  name="transactionTitle"
                  value={formData.transactionTitle}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#00529B' }}>
                    Expenses
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddExpense}
                    sx={{
                      color: '#00529B',
                      borderColor: '#00529B',
                      textTransform: 'none',
                    }}
                  >
                    Add Expense
                  </Button>
                </Box>

                {formData.expenses.map((expense, index) => (
                  <Box key={index} sx={style.expenseCard}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#00529B' }}>
                        Expense #{index + 1}
                      </Typography>
                      {formData.expenses.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveExpense(index)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Amount *"
                          type="number"
                          value={expense.amount}
                          onChange={(e) =>
                            handleExpenseChange(index, 'amount', e.target.value)
                          }
                          required
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Date *"
                          type="date"
                          value={expense.date}
                          onChange={(e) =>
                            handleExpenseChange(index, 'date', e.target.value)
                          }
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Supporting Documents
                        </Typography>
                        <Box sx={style.uploadBox}>
                          <input
                            accept="*/*"
                            style={{ display: 'none' }}
                            id={`edit-expense-file-${index}`}
                            multiple
                            type="file"
                            onChange={(e) => handleFileUpload(index, e)}
                          />
                          <label htmlFor={`edit-expense-file-${index}`}>
                            <Box sx={{ cursor: 'pointer' }}>
                              <CloudUploadIcon
                                sx={{ fontSize: 30, color: '#00529B' }}
                              />
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Click to upload
                              </Typography>
                            </Box>
                          </label>
                        </Box>
                        {expense.documents.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {expense.documents.map((file, fileIndex) => (
                              <Box
                                key={fileIndex}
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
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                  <AttachFileIcon
                                    sx={{
                                      mr: 1,
                                      color: '#00529B',
                                      fontSize: 18,
                                    }}
                                  />
                                  <Typography variant="caption">
                                    {file.name || file}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleRemoveFile(index, fileIndex)
                                  }
                                  sx={{ color: '#d32f2f' }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'rgba(0, 82, 155, 0.08)',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#00529B' }}>
                    Total Amount:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: '#00529B', fontWeight: 700 }}
                  >
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                    }).format(calculateTotalAmount())}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}
                >
                  <Button
                    onClick={handleClose}
                    sx={{ color: '#666', textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      bgcolor: '#00529B',
                      '&:hover': { bgcolor: '#003d73' },
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

export default EditPettyCashRequestModal;
