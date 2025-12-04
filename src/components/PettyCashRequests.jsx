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

  // Extract data from paginated responses
  const signers = signersData?.results || [];
  const availablePettyCash = pettyCashList?.results || [];
  const requests = pettyCashRequests?.results || [];

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllPettyCashRequests({ page: 1 }));
    dispatch(getAllSigners());
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
        supporting_document: null,
      },
    ],
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      related_petty_cash_id: '',
      verifier_id: '',
      expenses: [
        {
          date: '',
          item_description: '',
          amount: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      }));

      submitData.append('expenses', JSON.stringify(expensesData));

      formData.expenses.forEach((expense, index) => {
        if (expense.supporting_document) {
          submitData.append(
            `expense_${index}_document`,
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

      {/* Table - ENHANCED: Removed Verified & Verifier, Added Created At, Changed Related Petty Cash format */}
      <TableContainer component={Paper} elevation={2}>
        <Table sx={styles.table}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
              <TableCell sx={styles.headerCell}>ID</TableCell>
              <TableCell sx={styles.headerCell}>Requester</TableCell>
              <TableCell sx={styles.headerCell}>Related Petty Cash</TableCell>
              <TableCell sx={styles.headerCell}>Total Expenses (RWF)</TableCell>
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
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No petty cash requests found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow
                  key={request.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(0, 82, 155, 0.02)',
                    },
                  }}
                >
                  <TableCell>{request.id}</TableCell>
                  <TableCell>
                    {request.requester?.firstname} {request.requester?.lastname}
                  </TableCell>
                  <TableCell>
                    PC-{request.related_petty_cash?.id} - Issued by{' '}
                    {request.related_petty_cash?.issued_by?.firstname}{' '}
                    {request.related_petty_cash?.issued_by?.lastname}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(parseFloat(request.total_expenses || 0))}
                  </TableCell>
                  <TableCell>
                    {request.created_at
                      ? new Date(request.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusChip(request.status)}</TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        size="small"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => handleView(request)}
                        sx={{
                          color: '#00529B',
                          textTransform: 'none',
                          minWidth: '70px',
                          fontSize: '0.75rem',
                        }}
                      >
                        View
                      </Button>
                      {/* Edit button - commented out */}
                      {/* <Button
                        size="small"
                        startIcon={<EditOutlinedIcon />}
                        onClick={() => {
                          setSelectedRequest(request);
                          setOpenEditModal(true);
                        }}
                        sx={{
                          color: '#00529B',
                          textTransform: 'none',
                          minWidth: '70px',
                          fontSize: '0.75rem',
                        }}
                      >
                        Edit
                      </Button> */}
                      <Button
                        size="small"
                        startIcon={<TrackChangesIcon />}
                        onClick={() => handleTrackAndSign(request)}
                        sx={{
                          color: '#FFA726',
                          textTransform: 'none',
                          minWidth: '110px',
                          fontSize: '0.75rem',
                        }}
                      >
                        Track & Sign
                      </Button>
                      {/* Delete button - commented out */}
                      {/* <Button
                        size="small"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => handleDelete(request)}
                        sx={{
                          color: '#d32f2f',
                          textTransform: 'none',
                          minWidth: '70px',
                          fontSize: '0.75rem',
                        }}
                      >
                        Delete
                      </Button> */}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Request Petty Cash Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
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
          <Typography variant="h6">Request Petty Cash</Typography>
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
                    Select Related Petty Cash *
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
                        <em>Select a petty cash from the list</em>
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
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  PC-{pc.id} - {pc.holder?.firstname}{' '}
                                  {pc.holder?.lastname}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Amount: RWF{' '}
                                  {parseFloat(pc.amount || 0).toLocaleString()}{' '}
                                  • Remaining: RWF{' '}
                                  {parseFloat(
                                    pc.remaining_amount || 0
                                  ).toLocaleString()}
                                </Typography>
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
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 400,
                          },
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select a verifier from the list</em>
                      </MenuItem>
                      {signers.length === 0 ? (
                        <MenuItem value="" disabled>
                          <em>Loading signers...</em>
                        </MenuItem>
                      ) : (
                        signers.map((signer) => (
                          <MenuItem
                            key={signer.id}
                            value={signer.id}
                            sx={{ py: 1.5 }}
                          >
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {signer.firstname} {signer.lastname}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {signer.position} • {signer.department} •{' '}
                                {signer.section}
                              </Typography>
                            </Box>
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
                  <Typography
                    variant="h6"
                    sx={{ color: '#00529B', fontWeight: 600 }}
                  >
                    Expenses
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddExpense}
                    sx={{
                      color: '#00529B',
                      borderColor: '#00529B',
                      '&:hover': {
                        borderColor: '#003d73',
                        bgcolor: 'rgba(0, 82, 155, 0.05)',
                      },
                      textTransform: 'none',
                    }}
                  >
                    Add Expense
                  </Button>
                </Box>

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
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#00529B', fontWeight: 600 }}
                      >
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
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Date *"
                          type="date"
                          value={expense.date}
                          onChange={(e) =>
                            handleExpenseChange(index, 'date', e.target.value)
                          }
                          required
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={8}>
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
                          placeholder="e.g., Office supplies - pens, paper"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Amount (RWF) *"
                          type="number"
                          value={expense.amount}
                          onChange={(e) =>
                            handleExpenseChange(index, 'amount', e.target.value)
                          }
                          required
                          InputProps={{
                            inputProps: { min: 0, step: 100 },
                          }}
                          placeholder="e.g., 5000"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="caption"
                          gutterBottom
                          sx={{
                            color: '#666',
                            fontWeight: 500,
                            display: 'block',
                          }}
                        >
                          Supporting Document
                        </Typography>
                        <Box sx={styles.uploadBox}>
                          <input
                            accept="*/*"
                            style={{ display: 'none' }}
                            id={`expense-file-upload-${index}`}
                            type="file"
                            onChange={(e) => handleFileUpload(index, e)}
                          />
                          <label htmlFor={`expense-file-upload-${index}`}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <CloudUploadIcon
                                sx={{ fontSize: 30, color: '#00529B', mb: 0.5 }}
                              />
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Click to upload document
                              </Typography>
                            </Box>
                          </label>
                        </Box>

                        {expense.supporting_document && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1,
                              mt: 1,
                              bgcolor: 'rgba(0, 82, 155, 0.05)',
                              borderRadius: 1,
                              border: '1px solid rgba(0, 82, 155, 0.2)',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AttachFileIcon
                                sx={{
                                  mr: 1,
                                  color: '#00529B',
                                  fontSize: 18,
                                }}
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

                {/* Total Amount Summary */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'rgba(0, 82, 155, 0.08)',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
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
