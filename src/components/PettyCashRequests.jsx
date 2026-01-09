import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllPettyCashRequests,
  createPettyCashRequest,
  deletePettyCashRequest,
} from '../features/pettyCash/pettyCashSlice';
import { getAllSigners } from '../features/user/userSlice';
import { getAllPettyCash } from '../features/pettyCash/pettyCashSlice';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Tooltip,
  TablePagination,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import ViewPettyCashRequestModal from './ViewPettyCashRequestModal';
import TrackAndSignPettyCashDialog from './TrackAndSignPettyCashDialog';
// Commented out - Edit and Delete modals (functionality disabled)
// import EditPettyCashRequestModal from './EditPettyCashRequestModal';
// import DeletePettyCashRequestDialog from './DeletePettyCashRequestDialog';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  },
  table: {
    minWidth: 650,
  },
  headerCell: {
    color: '#00529B',
    fontSize: '14px',
    fontWeight: 600,
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

const PettyCashRequests = () => {
  const dispatch = useDispatch();
  const { pettyCashRequests, pettyCashList, isLoading } = useSelector(
    (state) => state.pettyCash
  );
  const { users: signersData } = useSelector((state) => state.user);

  const [openDialog, setOpenDialog] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openTrackSignDialog, setOpenTrackSignDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currencyError, setCurrencyError] = useState('');

  // Commented out - Edit and Delete modals (buttons disabled)
  // const [openEditModal, setOpenEditModal] = useState(false);
  // const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Extract data from paginated responses
  const signers = signersData?.results || [];
  const availablePettyCash = pettyCashList?.results || [];
  const requests = pettyCashRequests?.results || [];
  const totalCount = pettyCashRequests?.count || 0;

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    dispatch(getAllPettyCashRequests({ page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    dispatch(getAllPettyCashRequests({ page: 1 }));
  };

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllPettyCashRequests({ page: 1 }));
    dispatch(getAllSigners({ is_petty_cash_user: 'true' })); // Fetch only petty cash users
    dispatch(getAllPettyCash({ page: 1, status: 'active' }));
  }, [dispatch]);

  const [formData, setFormData] = useState({
    related_petty_cash_id: '',
    verifier_id: '',
    expenses: [
      {
        date: '',
        item_description: '',
        amount: '',
        currency: 'USD', // Default currency
        supporting_document: null,
      },
    ],
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrencyError('');
    setFormData({
      related_petty_cash_id: '',
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
  };

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
      setCurrencyError(''); // Clear any existing error
    }

    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const handleAddExpense = () => {
    // Use the currency from the first expense
    const firstExpenseCurrency = formData.expenses[0]?.currency || 'USD';

    setFormData({
      ...formData,
      expenses: [
        ...formData.expenses,
        {
          date: '',
          item_description: '',
          amount: '',
          currency: firstExpenseCurrency, // Match first expense currency
          supporting_document: null,
        },
      ],
    });
  };

  const handleRemoveExpense = (index) => {
    if (formData.expenses.length > 1) {
      const newExpenses = formData.expenses.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        expenses: newExpenses,
      });
    }
  };

  const handleFileUpload = (expenseIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      const newExpenses = [...formData.expenses];
      newExpenses[expenseIndex].supporting_document = file;
      setFormData({
        ...formData,
        expenses: newExpenses,
      });
    }
  };

  const handleRemoveFile = (expenseIndex) => {
    const newExpenses = [...formData.expenses];
    newExpenses[expenseIndex].supporting_document = null;
    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const validateCurrencies = () => {
    if (formData.expenses.length <= 1) return true;

    const firstCurrency = formData.expenses[0].currency;
    const allSameCurrency = formData.expenses.every(
      (expense) => expense.currency === firstCurrency
    );

    if (!allSameCurrency) {
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
      submitData.append(
        'related_petty_cash_id',
        formData.related_petty_cash_id
      );
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

      dispatch(getAllPettyCashRequests({ page: 1 }));

      handleCloseDialog();
    } catch (error) {
      toast.error(error || 'Failed to create petty cash request');
    }
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setOpenViewModal(true);
  };

  const handleTrackAndSign = (request) => {
    setSelectedRequest(request);
    setOpenTrackSignDialog(true);
  };

  // Commented out - Edit and Delete handlers (buttons disabled)
  // const handleEdit = (request) => {
  //   setSelectedRequest(request);
  //   setOpenEditModal(true);
  // };

  // const handleDelete = (request) => {
  //   setSelectedRequest(request);
  //   setOpenDeleteDialog(true);
  // };

  // const handleDeleteConfirm = async () => {
  //   try {
  //     await dispatch(deletePettyCashRequest(selectedRequest.id)).unwrap();
  //     toast.success('Petty cash request deleted successfully');
  //     dispatch(getAllPettyCashRequests({ page: 1 }));
  //     setOpenDeleteDialog(false);
  //     setSelectedRequest(null);
  //   } catch (error) {
  //     toast.error(error || 'Failed to delete petty cash request');
  //   }
  // };

  const getStatusChip = (status) => {
    const statusColors = {
      pending: { bgcolor: '#FFA726', color: 'white' },
      approved: { bgcolor: '#66BB6A', color: 'white' },
      denied: { bgcolor: '#EF5350', color: 'white' },
      verified: { bgcolor: '#42A5F5', color: 'white' },
    };

    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        size="small"
        sx={{
          ...statusColors[status],
          fontWeight: 500,
          minWidth: '80px',
        }}
      />
    );
  };

  const calculateTotalAmount = () => {
    return formData.expenses.reduce(
      (sum, expense) => sum + (parseFloat(expense.amount) || 0),
      0
    );
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={styles.header}>
        <Typography variant="h5" fontWeight={600} color="#00529B">
          Petty Cash Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            bgcolor: '#00529B',
            '&:hover': {
              bgcolor: '#003d73',
            },
            textTransform: 'none',
            px: 3,
          }}
        >
          Request Petty Cash
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table sx={styles.table}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
              <TableCell sx={styles.headerCell}>#</TableCell>
              <TableCell sx={styles.headerCell}>Requester</TableCell>
              <TableCell sx={styles.headerCell}>Related Petty Cash</TableCell>
              <TableCell sx={styles.headerCell}>Total Expenses</TableCell>
              <TableCell sx={styles.headerCell}>Currency</TableCell>
              <TableCell sx={styles.headerCell}>Created At</TableCell>
              <TableCell sx={styles.headerCell}>Status</TableCell>
              <TableCell sx={styles.headerCell} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No petty cash requests found
                  </Typography>
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
                    {request.requester?.firstname} {request.requester?.lastname}
                  </TableCell>
                  <TableCell>
                    PC-{request.related_petty_cash?.id} - Issued by{' '}
                    {request.related_petty_cash?.issued_by?.firstname}{' '}
                    {request.related_petty_cash?.issued_by?.lastname}
                  </TableCell>
                  <TableCell>{formatAmount(request.total_expenses)}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.currency || 'USD'}
                      size="small"
                      sx={{
                        bgcolor: '#00529B',
                        color: 'white',
                        fontWeight: 500,
                        minWidth: '60px',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {request.created_at
                      ? new Date(request.created_at).toLocaleString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusChip(request.status)}</TableCell>
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
                    {/* Edit button - Commented out (disabled) */}
                    {/* <Tooltip title="Edit" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(request)}
                        sx={{ color: '#FFA726' }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip> */}
                    <Tooltip title="Track & Sign" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleTrackAndSign(request)}
                        sx={{ color: '#42A5F5' }}
                      >
                        <TrackChangesIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {/* Delete button - Commented out (disabled) */}
                    {/* <Tooltip title="Delete" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(request)}
                        sx={{ color: '#EF5350' }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip> */}
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
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows':
              {
                mb: 0,
              },
          }}
        />
      </TableContainer>

      {/* Create Request Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
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
          <Typography variant="h6" fontWeight={600}>
            Create Petty Cash Request
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Currency Error Alert */}
              {currencyError && (
                <Grid item xs={12}>
                  <Alert severity="error" onClose={() => setCurrencyError('')}>
                    {currencyError}
                  </Alert>
                </Grid>
              )}

              {/* Related Petty Cash */}
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
                    variant="body2"
                    sx={{
                      color: '#00529B',
                      fontWeight: 600,
                      fontSize: '1rem',
                      mb: 1,
                    }}
                  >
                    Select Related Petty Cash Transactions *
                  </Typography>
                  <FormControl fullWidth required>
                    <Select
                      name="related_petty_cash_id"
                      value={formData.related_petty_cash_id}
                      onChange={handleInputChange}
                      displayEmpty
                      sx={{
                        fontSize: '1.1rem',
                        py: 2,
                        '& .MuiSelect-select': {
                          py: 1.5,
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 400,
                          },
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select a petty cash transaction from the list</em>
                      </MenuItem>
                      {availablePettyCash.length === 0 ? (
                        <MenuItem value="" disabled>
                          <em>No active petty cash available</em>
                        </MenuItem>
                      ) : (
                        availablePettyCash
                          .filter((pc) => pc.is_acknowledged)
                          .map((pc) => (
                            <MenuItem
                              key={pc.id}
                              value={pc.id}
                              sx={{ py: 1.5 }}
                            >
                              <Box sx={{ width: '100%' }}>
                                <Typography variant="body1" fontWeight={500}>
                                  {pc.holder?.firstname} {pc.holder?.lastname}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Amount: {pc.currency || 'USD'}{' '}
                                  {parseFloat(pc.amount || 0).toLocaleString()}{' '}
                                  • Remaining: {pc.currency || 'USD'}{' '}
                                  {parseFloat(
                                    pc.remaining_amount || 0
                                  ).toLocaleString()}
                                </Typography>
                                {pc.notes && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: 'block',
                                      fontStyle: 'italic',
                                      mt: 0.5,
                                      color: '#666',
                                    }}
                                  >
                                    Notes: {pc.notes}
                                  </Typography>
                                )}
                              </Box>
                            </MenuItem>
                          ))
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Verifier */}
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
                    variant="body2"
                    sx={{
                      color: '#00529B',
                      fontWeight: 600,
                      fontSize: '1rem',
                      mb: 1,
                    }}
                  >
                    Select Verifier *
                  </Typography>
                  <FormControl fullWidth required>
                    <Select
                      name="verifier_id"
                      value={formData.verifier_id}
                      onChange={handleInputChange}
                      displayEmpty
                      sx={{
                        fontSize: '1.1rem',
                        py: 2,
                        '& .MuiSelect-select': {
                          py: 1.5,
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select a verifier from the list</em>
                      </MenuItem>
                      {signers.length === 0 ? (
                        <MenuItem value="" disabled>
                          <em>No signers available</em>
                        </MenuItem>
                      ) : (
                        signers.map((signer) => (
                          <MenuItem key={signer.id} value={signer.id}>
                            {signer.firstname} {signer.lastname} -{' '}
                            {signer.position}
                          </MenuItem>
                        ))
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
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Date"
                          type="date"
                          value={expense.date}
                          onChange={(e) =>
                            handleExpenseChange(index, 'date', e.target.value)
                          }
                          fullWidth
                          required
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Item Description"
                          value={expense.item_description}
                          onChange={(e) =>
                            handleExpenseChange(
                              index,
                              'item_description',
                              e.target.value
                            )
                          }
                          fullWidth
                          required
                          size="small"
                          placeholder="e.g., Office supplies"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Amount"
                          type="number"
                          value={expense.amount}
                          onChange={(e) =>
                            handleExpenseChange(index, 'amount', e.target.value)
                          }
                          fullWidth
                          required
                          size="small"
                          inputProps={{ step: '0.01', min: '0' }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
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
                            disabled={index !== 0} // Only first expense can change currency
                          >
                            {CURRENCIES.map((curr) => (
                              <MenuItem key={curr.code} value={curr.code}>
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                  <Typography variant="body2" sx={{ mr: 1 }}>
                                    {curr.symbol}
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {curr.code}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    - {curr.name}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                          {index === 0 && formData.expenses.length > 1 && (
                            <Typography
                              variant="caption"
                              sx={{ mt: 0.5, color: '#00529B' }}
                            >
                              Changing this will update all expenses
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <input
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          id={`expense-file-${index}`}
                          type="file"
                          onChange={(e) => handleFileUpload(index, e)}
                        />
                        <label htmlFor={`expense-file-${index}`}>
                          <Box sx={styles.uploadBox}>
                            <CloudUploadIcon sx={{ color: '#00529B', mb: 1 }} />
                            <Typography variant="caption">
                              {expense.supporting_document
                                ? expense.supporting_document.name
                                : 'Upload Receipt'}
                            </Typography>
                          </Box>
                        </label>
                        {expense.supporting_document && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mt: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <AttachFileIcon
                                fontSize="small"
                                sx={{ color: '#00529B' }}
                              />
                              <Typography variant="caption">
                                {expense.supporting_document.name}
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
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                {/* Total Amount Display */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'rgba(0, 82, 155, 0.08)',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Total Amount ({formData.expenses[0]?.currency || 'USD'}):
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#00529B">
                    {calculateTotalAmount().toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseDialog}
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
              Submit Request
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modals */}
      {selectedRequest && (
        <ViewPettyCashRequestModal
          open={openViewModal}
          handleClose={() => {
            setOpenViewModal(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
        />
      )}

      {/* Edit Petty Cash Request Modal - Commented out (Edit button disabled) */}
      {/* {selectedRequest && (
        <EditPettyCashRequestModal
          open={openEditModal}
          handleClose={() => {
            setOpenEditModal(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
        />
      )} */}

      {selectedRequest && (
        <TrackAndSignPettyCashDialog
          open={openTrackSignDialog}
          handleClose={() => {
            setOpenTrackSignDialog(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
        />
      )}

      {/* Delete Request Dialog - Commented out (Delete button disabled) */}
      {/* {selectedRequest && (
        <DeletePettyCashRequestDialog
          open={openDeleteDialog}
          handleClose={() => {
            setOpenDeleteDialog(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onDelete={handleDeleteConfirm}
        />
      )} */}
    </Box>
  );
};

export default PettyCashRequests;
