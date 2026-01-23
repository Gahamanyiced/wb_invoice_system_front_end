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
  Divider,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';

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
  expenseCard: {
    p: 2,
    mb: 2,
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    bgcolor: 'rgba(0, 82, 155, 0.02)',
  },
};

const EditExpenseModal = ({
  open,
  handleClose,
  request,
  onUpdate,
  signers,
  currencies,
}) => {
  const [formData, setFormData] = useState({
    verifier_id: '',
    expenses: [],
  });
  const [currencyError, setCurrencyError] = useState('');

  // Pre-fill form with request data when modal opens
  useEffect(() => {
    if (request) {
      setFormData({
        verifier_id: request.verifier?.id || '',
        expenses: request.expenses?.map((exp) => ({
          id: exp.id,
          date: exp.date || '',
          item_description: exp.item_description || '',
          amount: exp.amount || '',
          currency: exp.currency || 'USD',
          supporting_document: null, // Don't pre-fill files
          existing_document: exp.supporting_document || null,
        })) || [
          {
            date: '',
            item_description: '',
            amount: '',
            currency: 'USD',
            supporting_document: null,
            existing_document: null,
          },
        ],
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

  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...formData.expenses];
    newExpenses[index][field] = value;

    // If currency is changed on the first expense, update all other expenses
    if (index === 0 && field === 'currency') {
      newExpenses.forEach((expense, i) => {
        if (i !== 0) {
          expense.currency = value;
        }
      });
    }

    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const handleExpenseFileChange = (index, file) => {
    const newExpenses = [...formData.expenses];
    newExpenses[index].supporting_document = file;
    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const handleRemoveExpenseFile = (index) => {
    const newExpenses = [...formData.expenses];
    newExpenses[index].supporting_document = null;
    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const handleAddExpense = () => {
    setFormData({
      ...formData,
      expenses: [
        ...formData.expenses,
        {
          date: '',
          item_description: '',
          amount: '',
          currency: formData.expenses[0]?.currency || 'USD',
          supporting_document: null,
          existing_document: null,
        },
      ],
    });
  };

  const handleRemoveExpense = (index) => {
    if (formData.expenses.length === 1) {
      return; // Keep at least one expense
    }
    const newExpenses = formData.expenses.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const validateCurrencies = () => {
    const currencies = formData.expenses.map((exp) => exp.currency);
    const uniqueCurrencies = [...new Set(currencies)];

    if (uniqueCurrencies.length > 1) {
      const firstCurrency = formData.expenses[0].currency;
      setCurrencyError(
        `All expenses must use the same currency. Please ensure all expenses use ${firstCurrency}.`,
      );
      return false;
    }

    setCurrencyError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCurrencies()) {
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('related_petty_cash_id', request.related_petty_cash?.id);
    submitData.append('verifier_id', formData.verifier_id);

    const expensesData = formData.expenses.map((expense) => ({
      ...(expense.id && { id: expense.id }), // Include ID if it exists
      date: expense.date,
      item_description: expense.item_description,
      amount: expense.amount,
      currency: expense.currency,
    }));

    submitData.append('expenses', JSON.stringify(expensesData));

    // Only append new documents if they were uploaded
    formData.expenses.forEach((expense, index) => {
      if (expense.supporting_document) {
        submitData.append(
          `expense_document_${index}`,
          expense.supporting_document,
        );
      }
    });

    onUpdate(request.id, submitData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#00529B',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Edit Expense Request</Typography>
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

            {/* Expenses Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="#00529B" fontWeight={600}>
                  Expenses
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddExpense}
                  sx={{
                    borderColor: '#00529B',
                    color: '#00529B',
                  }}
                >
                  Add Expense
                </Button>
              </Box>

              {currencyError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {currencyError}
                </Alert>
              )}

              {formData.expenses.map((expense, index) => (
                <Box key={index} sx={styles.expenseCard}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Expense #{index + 1}
                    </Typography>
                    {formData.expenses.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveExpense(index)}
                        sx={{ color: '#EF5350' }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
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
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Amount *"
                        type="number"
                        value={expense.amount}
                        onChange={(e) =>
                          handleExpenseChange(index, 'amount', e.target.value)
                        }
                        required
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 },
                        }}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required size="small">
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={expense.currency}
                          onChange={(e) =>
                            handleExpenseChange(
                              index,
                              'currency',
                              e.target.value,
                            )
                          }
                          label="Currency"
                          disabled={index !== 0}
                        >
                          {currencies.map((curr) => (
                            <MenuItem key={curr.code} value={curr.code}>
                              {curr.symbol} {curr.code}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Item Description *"
                        value={expense.item_description}
                        onChange={(e) =>
                          handleExpenseChange(
                            index,
                            'item_description',
                            e.target.value,
                          )
                        }
                        required
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      {expense.existing_document &&
                        !expense.supporting_document && (
                          <Box
                            sx={{
                              mb: 1,
                              p: 1,
                              bgcolor: 'rgba(0, 82, 155, 0.05)',
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Current:{' '}
                              {expense.existing_document.split('/').pop()}
                            </Typography>
                          </Box>
                        )}

                      <Box sx={styles.uploadBox}>
                        <input
                          accept="*/*"
                          style={{ display: 'none' }}
                          id={`edit-expense-file-${index}`}
                          type="file"
                          onChange={(e) =>
                            handleExpenseFileChange(index, e.target.files[0])
                          }
                        />
                        <label htmlFor={`edit-expense-file-${index}`}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <CloudUploadIcon
                              sx={{ fontSize: 30, color: '#00529B' }}
                            />
                            <Typography variant="caption">
                              Upload new receipt
                            </Typography>
                          </Box>
                        </label>
                      </Box>

                      {expense.supporting_document && (
                        <Box
                          sx={{
                            mt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            bgcolor: 'rgba(0, 82, 155, 0.05)',
                            borderRadius: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachFileIcon sx={{ mr: 1, color: '#00529B' }} />
                            <Typography variant="caption">
                              {expense.supporting_document.name}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExpenseFile(index)}
                            sx={{ color: '#d32f2f' }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              ))}
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

export default EditExpenseModal;
