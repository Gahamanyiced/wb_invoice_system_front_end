import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createPettyCashRequest,
  getAllPettyCashRequests,
  updatePettyCashRequest,
  deletePettyCashRequest,
} from '../features/pettyCash/pettyCashSlice';
import { getAllSigners } from '../features/user/userSlice';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Tooltip,
  TablePagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DownloadIcon from '@mui/icons-material/Download';
import RootLayout from '../layouts/RootLayout';
import ViewPettyCashRequestModal from '../components/ViewPettyCashRequestModal';
import TrackAndSignPettyCashDialog from '../components/TrackAndSignPettyCashDialog';
import EditExpenseModal from '../components/EditExpenseModal';
import DeleteExpenseDialog from '../components/DeleteExpenseDialog';

// Currency options
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
];

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  },
  section: {
    mb: 3,
    p: 3,
    borderRadius: 2,
  },
  expenseCard: {
    p: 2,
    mb: 2,
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    bgcolor: 'rgba(0, 82, 155, 0.02)',
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
  table: {
    minWidth: 650,
  },
  headerCell: {
    color: '#00529B',
    fontSize: '14px',
    fontWeight: 600,
  },
};

const ManageExpenses = () => {
  const { transactionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const transaction = location.state?.transaction;
  const { pettyCashRequests, isLoading } = useSelector(
    (state) => state.pettyCash
  );
  const { users: signersData } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    verifier_id: '',
    expenses: [
      {
        date: '',
        item_description: '',
        amount: '',
        currency: 'USD',
        supporting_document: null,
      },
    ],
  });

  const [currencyError, setCurrencyError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openTrackSignDialog, setOpenTrackSignDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const signers = signersData?.results || [];
  const requests = pettyCashRequests?.results || [];
  const totalCount = pettyCashRequests?.count || 0;

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    dispatch(
      getAllPettyCashRequests({
        page: newPage + 1,
        related_petty_cash_id: transactionId,
      })
    );
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    dispatch(
      getAllPettyCashRequests({
        page: 1,
        related_petty_cash_id: transactionId,
      })
    );
  };

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllSigners({ is_petty_cash_user: 'true' }));
    dispatch(
      getAllPettyCashRequests({
        page: 1,
        related_petty_cash_id: transactionId,
      })
    );
  }, [dispatch, transactionId]);

  // Form handlers
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
        },
      ],
    });
  };

  const handleRemoveExpense = (index) => {
    if (formData.expenses.length === 1) {
      toast.error('At least one expense is required');
      return;
    }
    const newExpenses = formData.expenses.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    // Reset form
    setFormData({
      verifier_id: '',
      expenses: [
        {
          date: '',
          item_description: '',
          amount: '',
          currency: 'USD',
          supporting_document: null,
        },
      ],
    });
    setCurrencyError('');
  };

  // Validate currencies
  const validateCurrencies = () => {
    const currencies = formData.expenses.map((exp) => exp.currency);
    const uniqueCurrencies = [...new Set(currencies)];

    if (uniqueCurrencies.length > 1) {
      const firstCurrency = formData.expenses[0].currency;
      setCurrencyError(
        `All expenses must use the same currency. Please ensure all expenses use ${firstCurrency}.`
      );
      return false;
    }

    setCurrencyError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate currencies before submitting
    if (!validateCurrencies()) {
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('related_petty_cash_id', transactionId);
      submitData.append('verifier_id', formData.verifier_id);

      const expensesData = formData.expenses.map((expense) => ({
        date: expense.date,
        item_description: expense.item_description,
        amount: expense.amount,
        currency: expense.currency,
      }));

      submitData.append('expenses', JSON.stringify(expensesData));

      formData.expenses.forEach((expense, index) => {
        if (expense.supporting_document) {
          submitData.append(
            `expense_document_${index}`,
            expense.supporting_document
          );
        }
      });

      await dispatch(createPettyCashRequest(submitData)).unwrap();
      toast.success('Petty cash request created successfully');

      // Close dialog and reset form
      handleCloseCreateDialog();

      // Refresh list
      dispatch(
        getAllPettyCashRequests({
          page: 1,
          related_petty_cash_id: transactionId,
        })
      );
    } catch (error) {
      toast.error(error || 'Failed to create petty cash request');
    }
  };

  // Action handlers
  const handleView = (request) => {
    setSelectedRequest(request);
    setOpenViewModal(true);
  };

  const handleTrackAndSign = (request) => {
    setSelectedRequest(request);
    setOpenTrackSignDialog(true);
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setOpenEditModal(true);
  };

  const handleDelete = (request) => {
    setSelectedRequest(request);
    setOpenDeleteDialog(true);
  };

  const handleEditSubmit = async (id, formData) => {
    try {
      await dispatch(
        updatePettyCashRequest({
          id,
          formData,
        })
      ).unwrap();
      toast.success('Request updated successfully');
      handleCloseEditModal();
      dispatch(
        getAllPettyCashRequests({
          page: 1,
          related_petty_cash_id: transactionId,
        })
      );
    } catch (error) {
      toast.error(error || 'Failed to update request');
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await dispatch(deletePettyCashRequest(id)).unwrap();
      toast.success('Request deleted successfully');
      handleCloseDeleteDialog();
      dispatch(
        getAllPettyCashRequests({
          page: 1,
          related_petty_cash_id: transactionId,
        })
      );
    } catch (error) {
      toast.error(error || 'Failed to delete request');
    }
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedRequest(null);
  };

  const handleCloseTrackSignDialog = () => {
    setOpenTrackSignDialog(false);
    setSelectedRequest(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedRequest(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedRequest(null);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!requests || requests.length === 0) {
      toast.error('No expense data to export');
      return;
    }

    // Flatten all expenses from all requests
    const allExpenses = [];
    requests.forEach((request) => {
      if (request.expenses && request.expenses.length > 0) {
        request.expenses.forEach((expense) => {
          allExpenses.push({
            'Request ID': request.id,
            'Requester': `${request.requester?.firstname || ''} ${request.requester?.lastname || ''}`.trim(),
            'Verifier': `${request.verifier?.firstname || ''} ${request.verifier?.lastname || ''}`.trim(),
            'Date': expense.date || '',
            'Item Description': expense.item_description || '',
            'Amount': parseFloat(expense.amount || 0).toFixed(2),
            'Currency': expense.currency || 'USD',
            'Request Status': request.status || '',
            'Created At': request.created_at ? new Date(request.created_at).toLocaleDateString() : '',
          });
        });
      }
    });

    if (allExpenses.length === 0) {
      toast.error('No expenses found to export');
      return;
    }

    // Convert to CSV
    const headers = Object.keys(allExpenses[0]);
    const csvContent = [
      headers.join(','),
      ...allExpenses.map((row) =>
        headers.map((header) => {
          const value = row[header];
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_transaction_${transactionId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV exported successfully');
  };

  const getStatusChip = (status) => {
    const statusColors = {
      pending: { bgcolor: '#FFA726', color: 'white' },
      approved: { bgcolor: '#66BB6A', color: 'white' },
      denied: { bgcolor: '#EF5350', color: 'white' },
      verified: { bgcolor: '#42A5F5', color: 'white' },
      rolled_back: { bgcolor: '#9E9E9E', color: 'white' },
      'to verify': { bgcolor: '#42A5F5', color: 'white' },
      'to sign': { bgcolor: '#FF9800', color: 'white' },
    };

    const displayStatus = status?.replace(/_/g, ' ') || 'N/A';

    return (
      <Chip
        label={
          displayStatus
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }
        size="small"
        sx={{
          ...(statusColors[status?.toLowerCase()] || {
            bgcolor: '#9E9E9E',
            color: 'white',
          }),
          fontWeight: 500,
          minWidth: '80px',
        }}
      />
    );
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  return (
    <RootLayout>
      <Box>
        {/* Header with Back Button and Create Button */}
        <Box sx={styles.header}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/petty-cash')}
              sx={{
                bgcolor: 'rgba(0, 82, 155, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(0, 82, 155, 0.2)',
                },
              }}
            >
              <ArrowBackIcon sx={{ color: '#00529B' }} />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={600} color="#00529B">
                Manage Expenses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transaction: {transaction?.holder?.firstname}{' '}
                {transaction?.holder?.lastname} - $
                {formatAmount(transaction?.amount)} {transaction?.currency}
              </Typography>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              sx={{
                borderColor: '#00529B',
                color: '#00529B',
                '&:hover': {
                  borderColor: '#003d73',
                  bgcolor: 'rgba(0, 82, 155, 0.05)',
                },
                textTransform: 'none',
              }}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{
                bgcolor: '#00529B',
                '&:hover': {
                  bgcolor: '#003d73',
                },
                textTransform: 'none',
                px: 3,
              }}
            >
              Create Expense Request
            </Button>
          </Box>
        </Box>

        {/* Expense Requests List */}
        <Paper elevation={2} sx={{ mt: 3 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" color="#00529B" fontWeight={600}>
              Expense Requests for this Transaction
            </Typography>
          </Box>

          <TableContainer>
            <Table sx={styles.table}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
                  <TableCell sx={styles.headerCell}>#</TableCell>
                  <TableCell sx={styles.headerCell}>Requester</TableCell>
                  <TableCell sx={styles.headerCell}>Verifier</TableCell>
                  <TableCell sx={styles.headerCell}>Total Expenses</TableCell>
                  <TableCell sx={styles.headerCell}>Status</TableCell>
                  <TableCell sx={styles.headerCell}>Created At</TableCell>
                  <TableCell sx={styles.headerCell} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      No expense requests found for this transaction
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request, index) => (
                    <TableRow
                      key={request.id}
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(0, 82, 155, 0.02)',
                        },
                      }}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        {request.requester?.firstname}{' '}
                        {request.requester?.lastname}
                      </TableCell>
                      <TableCell>
                        {request.verifier?.firstname}{' '}
                        {request.verifier?.lastname}
                      </TableCell>
                      <TableCell>
                        ${formatAmount(request.total_expenses)}
                      </TableCell>
                      <TableCell>{getStatusChip(request.status)}</TableCell>
                      <TableCell>
                        {request.created_at
                          ? new Date(request.created_at).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleView(request)}
                            sx={{ color: '#00529B' }}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(request)}
                            sx={{ color: '#FFA726' }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Track & Sign" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleTrackAndSign(request)}
                            sx={{ color: '#42A5F5' }}
                          >
                            <TrackChangesIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(request)}
                            sx={{ color: '#EF5350' }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid rgba(224, 224, 224, 1)',
              }}
            />
          </TableContainer>
        </Paper>

        {/* Create Expense Request Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={handleCloseCreateDialog}
          maxWidth="md"
          fullWidth
          scroll="paper"
        >
          <DialogTitle
            sx={{
              bgcolor: '#00529B',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Create Expense Request</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseCreateDialog}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Verifier Selection - Prominent */}
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
                        fontSize: '1rem',
                      }}
                    >
                      Select Verifier *
                    </Typography>
                    <FormControl fullWidth required size="large">
                      <InputLabel sx={{ fontSize: '1.1rem' }}>
                        Choose Verifier
                      </InputLabel>
                      <Select
                        name="verifier_id"
                        value={formData.verifier_id}
                        onChange={handleInputChange}
                        label="Choose Verifier"
                        sx={{
                          fontSize: '1.1rem',
                          '& .MuiSelect-select': {
                            py: 2,
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Select a verifier from the list</em>
                        </MenuItem>
                        {signers.length > 0 ? (
                          signers.map((signer) => (
                            <MenuItem key={signer.id} value={signer.id}>
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {signer.firstname} {signer.lastname}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {signer.position} • {signer.department}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="" disabled>
                            <em>No signers available</em>
                          </MenuItem>
                        )}
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
                        '&:hover': {
                          borderColor: '#003d73',
                          bgcolor: 'rgba(0, 82, 155, 0.05)',
                        },
                      }}
                    >
                      Add Expense
                    </Button>
                  </Box>

                  {/* Currency Error Alert */}
                  {currencyError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {currencyError}
                    </Alert>
                  )}

                  {/* Expense Items */}
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
                                  e.target.value
                                )
                              }
                              label="Currency"
                              disabled={index !== 0}
                            >
                              {CURRENCIES.map((curr) => (
                                <MenuItem key={curr.code} value={curr.code}>
                                  {curr.symbol} {curr.code} - {curr.name}
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
                                e.target.value
                              )
                            }
                            required
                            size="small"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography
                            variant="caption"
                            sx={{ color: '#00529B', fontWeight: 600, mb: 1 }}
                          >
                            Supporting Document (Optional)
                          </Typography>
                          <Box sx={styles.uploadBox}>
                            <input
                              accept="*/*"
                              style={{ display: 'none' }}
                              id={`expense-file-${index}`}
                              type="file"
                              onChange={(e) =>
                                handleExpenseFileChange(index, e.target.files[0])
                              }
                            />
                            <label htmlFor={`expense-file-${index}`}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                }}
                              >
                                <CloudUploadIcon
                                  sx={{ fontSize: 30, color: '#00529B', mb: 1 }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                  Click to upload receipt
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
                                <AttachFileIcon
                                  sx={{ mr: 1, color: '#00529B', fontSize: 18 }}
                                />
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
                onClick={handleCloseCreateDialog}
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
                  px: 4,
                }}
              >
                Submit Request
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Modals */}
        {selectedRequest && (
          <>
            <ViewPettyCashRequestModal
              open={openViewModal}
              handleClose={handleCloseViewModal}
              request={selectedRequest}
            />
            <TrackAndSignPettyCashDialog
              open={openTrackSignDialog}
              handleClose={handleCloseTrackSignDialog}
              request={selectedRequest}
            />
            <EditExpenseModal
              open={openEditModal}
              handleClose={handleCloseEditModal}
              request={selectedRequest}
              onUpdate={handleEditSubmit}
              signers={signers}
              currencies={CURRENCIES}
            />
            <DeleteExpenseDialog
              open={openDeleteDialog}
              handleClose={handleCloseDeleteDialog}
              request={selectedRequest}
              onDelete={handleDeleteConfirm}
            />
          </>
        )}
      </Box>
    </RootLayout>
  );
};

export default ManageExpenses;