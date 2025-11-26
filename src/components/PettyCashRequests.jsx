import { useState } from 'react';
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
import EditPettyCashRequestModal from './EditPettyCashRequestModal';
import TrackAndSignPettyCashDialog from './TrackAndSignPettyCashDialog';
import DeletePettyCashRequestDialog from './DeletePettyCashRequestDialog';

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
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openTrackSignDialog, setOpenTrackSignDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [requests, setRequests] = useState([
    // Sample data - replace with actual data from API
    {
      id: 1,
      transactionTitle: 'Office Supplies',
      totalAmount: 75000,
      requestDate: '2024-11-18',
      status: 'pending',
      expenses: [
        {
          amount: 50000,
          date: '2024-11-15',
          documents: ['receipt1.pdf'],
        },
        {
          amount: 25000,
          date: '2024-11-16',
          documents: ['receipt2.pdf'],
        },
      ],
    },
  ]);

  const [formData, setFormData] = useState({
    transactionTitle: '',
    expenses: [
      {
        amount: '',
        date: '',
        documents: [],
      },
    ],
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setFormData({
      transactionTitle: '',
      expenses: [
        {
          amount: '',
          date: '',
          documents: [],
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
          amount: '',
          date: '',
          documents: [],
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
    const files = Array.from(e.target.files);
    const newExpenses = [...formData.expenses];
    newExpenses[expenseIndex].documents = [
      ...newExpenses[expenseIndex].documents,
      ...files,
    ];
    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const handleRemoveFile = (expenseIndex, fileIndex) => {
    const newExpenses = [...formData.expenses];
    newExpenses[expenseIndex].documents = newExpenses[
      expenseIndex
    ].documents.filter((_, i) => i !== fileIndex);
    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend API
    console.log('Form submitted:', formData);
    handleCloseDialog();
  };

  // Handler functions for actions
  const handleView = (request) => {
    setSelectedRequest(request);
    setOpenViewModal(true);
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setOpenEditModal(true);
  };

  const handleTrackAndSign = (request) => {
    setSelectedRequest(request);
    setOpenTrackSignDialog(true);
  };

  const handleDelete = (request) => {
    setSelectedRequest(request);
    setOpenDeleteDialog(true);
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedRequest(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedRequest(null);
  };

  const handleCloseTrackSignDialog = () => {
    setOpenTrackSignDialog(false);
    setSelectedRequest(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedRequest(null);
  };

  const getStatusChip = (status) => {
    const statusColors = {
      pending: { bgcolor: '#FFA726', color: 'white' },
      approved: { bgcolor: '#66BB6A', color: 'white' },
      denied: { bgcolor: '#EF5350', color: 'white' },
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

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table sx={styles.table}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
              <TableCell sx={styles.headerCell}>ID</TableCell>
              <TableCell sx={styles.headerCell}>Transaction Title</TableCell>
              <TableCell sx={styles.headerCell}>Total Amount</TableCell>
              <TableCell sx={styles.headerCell}>Expenses Count</TableCell>
              <TableCell sx={styles.headerCell}>Request Date</TableCell>
              <TableCell sx={styles.headerCell}>Status</TableCell>
              <TableCell sx={styles.headerCell} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
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
                <TableCell>{request.transactionTitle}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('en-RW', {
                    style: 'currency',
                    currency: 'RWF',
                  }).format(request.totalAmount)}
                </TableCell>
                <TableCell>{request.expenses.length}</TableCell>
                <TableCell>{request.requestDate}</TableCell>
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
                    <Button
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => handleEdit(request)}
                      sx={{
                        color: '#00529B',
                        textTransform: 'none',
                        minWidth: '70px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Edit
                    </Button>
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
                    <Button
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
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
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
              {/* Transaction Title - Text input instead of dropdown */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Transaction Title *"
                  name="transactionTitle"
                  value={formData.transactionTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter transaction title"
                />
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
                      {/* Expense Amount */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Expense Amount *"
                          type="number"
                          value={expense.amount}
                          onChange={(e) =>
                            handleExpenseChange(index, 'amount', e.target.value)
                          }
                          required
                          InputProps={{
                            inputProps: { min: 0 },
                          }}
                        />
                      </Grid>

                      {/* Expense Date */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Expense Date *"
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

                      {/* Expense Supporting Documents */}
                      <Grid item xs={12}>
                        <Typography
                          variant="caption"
                          gutterBottom
                          sx={{ color: '#666', fontWeight: 500 }}
                        >
                          Supporting Documents
                        </Typography>
                        <Box sx={styles.uploadBox}>
                          <input
                            accept="*/*"
                            style={{ display: 'none' }}
                            id={`expense-file-upload-${index}`}
                            multiple
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
                                Click to upload documents
                              </Typography>
                            </Box>
                          </label>
                        </Box>

                        {/* Display uploaded files for this expense */}
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

      {/* View Petty Cash Request Modal */}
      {selectedRequest && (
        <ViewPettyCashRequestModal
          open={openViewModal}
          handleClose={handleCloseViewModal}
          request={selectedRequest}
        />
      )}

      {/* Edit Petty Cash Request Modal */}
      {selectedRequest && (
        <EditPettyCashRequestModal
          open={openEditModal}
          handleClose={handleCloseEditModal}
          request={selectedRequest}
        />
      )}

      {/* Track & Sign Dialog */}
      {selectedRequest && (
        <TrackAndSignPettyCashDialog
          open={openTrackSignDialog}
          handleClose={handleCloseTrackSignDialog}
          request={selectedRequest}
        />
      )}

      {/* Delete Request Dialog */}
      {selectedRequest && (
        <DeletePettyCashRequestDialog
          open={openDeleteDialog}
          handleClose={handleCloseDeleteDialog}
          request={selectedRequest}
        />
      )}
    </Box>
  );
};

export default PettyCashRequests;
