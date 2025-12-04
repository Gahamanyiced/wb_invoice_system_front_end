import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  issuePettyCash,
  getAllPettyCash,
  acknowledgePettyCash,
} from '../features/pettyCash/pettyCashSlice';
import { getAllSigners } from '../features/user/userSlice';
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
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ViewTransactionModal from './ViewTransactionModal';
import AcknowledgeTransactionDialog from './AcknowledgeTransactionDialog';
import EditTransactionModal from './EditTransactionModal';
import DeleteTransactionDialog from './DeleteTransactionDialog';

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
};

const PettyCashTransactions = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openAcknowledgeDialog, setOpenAcknowledgeDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const dispatch = useDispatch();
  const { pettyCashList, isLoading } = useSelector((state) => state.pettyCash);
  const { users: signersData } = useSelector((state) => state.user);

  const [transactions, setTransactions] = useState([]);

  // Extract signers from paginated response
  const signers = signersData?.results || [];

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllPettyCash({ page: 1 }));
    dispatch(getAllSigners()); // Fetch signers for the dropdown
  }, [dispatch]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (pettyCashList?.results) {
      setTransactions(pettyCashList.results);
    }
  }, [pettyCashList]);

  const [formData, setFormData] = useState({
    amount: '',
    holder_id: '',
    issue_date: '',
    notes: '',
    supporting_document: null,
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setFormData({
      amount: '',
      holder_id: '',
      issue_date: '',
      notes: '',
      supporting_document: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      supporting_document: file,
    });
  };

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      supporting_document: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('holder_id', formData.holder_id);
    submitData.append('amount', formData.amount);
    submitData.append('issue_date', formData.issue_date);
    submitData.append('notes', formData.notes);

    if (formData.supporting_document) {
      submitData.append('supporting_document', formData.supporting_document);
    }

    try {
      await dispatch(issuePettyCash(submitData)).unwrap();
      toast.success('Petty cash issued successfully');
      handleCloseDialog();
      // Refresh the list
      dispatch(getAllPettyCash({ page: 1 }));
    } catch (error) {
      toast.error(error || 'Failed to issue petty cash');
    }
  };

  // Handler functions for actions
  const handleView = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenViewModal(true);
  };

  const handleAcknowledge = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenAcknowledgeDialog(true);
  };

  const handleAcknowledgeSubmit = async (id, comment) => {
    try {
      await dispatch(
        acknowledgePettyCash({
          id,
          formData: { acknowledgment_notes: comment },
        })
      ).unwrap();
      toast.success('Transaction acknowledged successfully');
      handleCloseAcknowledgeDialog();
      // Refresh the list
      dispatch(getAllPettyCash({ page: 1 }));
    } catch (error) {
      toast.error(error || 'Failed to acknowledge transaction');
    }
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedTransaction(null);
  };

  const handleCloseAcknowledgeDialog = () => {
    setOpenAcknowledgeDialog(false);
    setSelectedTransaction(null);
  };

  const getStatusChip = (status) => {
    const statusColors = {
      active: { bgcolor: '#66BB6A', color: 'white' },
      exhausted: { bgcolor: '#EF5350', color: 'white' },
      pending: { bgcolor: '#FFA726', color: 'white' },
    };

    return (
      <Chip
        label={
          status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'
        }
        size="small"
        sx={{
          ...(statusColors[status] || { bgcolor: '#9E9E9E', color: 'white' }),
          fontWeight: 500,
          minWidth: '80px',
        }}
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={styles.header}>
        <Typography variant="h5" fontWeight={600} color="#00529B">
          Transactions
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
          Create Transaction
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table sx={styles.table}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
              <TableCell sx={styles.headerCell}>ID</TableCell>
              <TableCell sx={styles.headerCell}>Holder</TableCell>
              <TableCell sx={styles.headerCell}>Amount</TableCell>
              <TableCell sx={styles.headerCell}>Remaining</TableCell>
              <TableCell sx={styles.headerCell}>Issue Date</TableCell>
              <TableCell sx={styles.headerCell}>Created At</TableCell>
              <TableCell sx={styles.headerCell}>Status</TableCell>
              <TableCell sx={styles.headerCell}>Acknowledged</TableCell>
              <TableCell sx={styles.headerCell} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(0, 82, 155, 0.02)',
                    },
                  }}
                >
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>
                    {transaction.holder?.firstname}{' '}
                    {transaction.holder?.lastname}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                    }).format(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                    }).format(transaction.remaining_amount)}
                  </TableCell>
                  <TableCell>{transaction.issue_date}</TableCell>
                  <TableCell>
                    {transaction.created_at
                      ? new Date(transaction.created_at).toLocaleString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusChip(transaction.status)}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.is_acknowledged ? 'Yes' : 'No'}
                      size="small"
                      sx={{
                        bgcolor: transaction.is_acknowledged
                          ? '#66BB6A'
                          : '#FFA726',
                        color: 'white',
                        fontWeight: 500,
                        minWidth: '60px',
                      }}
                    />
                  </TableCell>
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
                        onClick={() => handleView(transaction)}
                        sx={{
                          color: '#00529B',
                          textTransform: 'none',
                          minWidth: '70px',
                          fontSize: '0.75rem',
                        }}
                      >
                        View
                      </Button>
                      {(() => {
                        // Get logged-in user from localStorage
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                          const loggedInUser = JSON.parse(userStr);
                          // Show acknowledge button only if logged-in user is the holder
                          if (loggedInUser.id === transaction.holder?.id) {
                            return (
                              <Button
                                size="small"
                                startIcon={<CheckCircleOutlineIcon />}
                                onClick={() => handleAcknowledge(transaction)}
                                sx={{
                                  color: '#66BB6A',
                                  textTransform: 'none',
                                  minWidth: '110px',
                                  fontSize: '0.75rem',
                                }}
                              >
                                Acknowledge
                              </Button>
                            );
                          }
                        }
                        return null;
                      })()}
                      {/* Edit and Delete buttons commented as requested
                    <Button
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => handleEdit(transaction)}
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
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => handleDelete(transaction)}
                      sx={{
                        color: '#d32f2f',
                        textTransform: 'none',
                        minWidth: '70px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Delete
                    </Button>
                    */}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Transaction Dialog */}
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
          <Typography variant="h6">Create Transaction</Typography>
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
              {/* Select Holder - Prominently displayed at the top with larger size */}
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
                    Select Petty Cash Holder *
                  </Typography>
                  <FormControl fullWidth required size="large">
                    <InputLabel sx={{ fontSize: '1.1rem' }}>
                      Choose Holder
                    </InputLabel>
                    <Select
                      name="holder_id"
                      value={formData.holder_id}
                      onChange={handleInputChange}
                      label="Choose Holder"
                      sx={{
                        fontSize: '1.1rem',
                        '& .MuiSelect-select': {
                          py: 2,
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
                        <em>Select a holder from the list</em>
                      </MenuItem>
                      {signers && signers.length > 0 ? (
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
                                sx={{ display: 'block' }}
                              >
                                {signer.position} • {signer.department} •{' '}
                                {signer.section}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          <em>Loading signers...</em>
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Amount and Issue Date - Side by side */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount (RWF) *"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    inputProps: { min: 0, step: 100 },
                  }}
                  placeholder="e.g., 50000"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issue Date *"
                  name="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes / Purpose"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  placeholder="Describe the purpose of this petty cash issuance..."
                />
              </Grid>

              {/* Supporting Document */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: '#00529B', fontWeight: 600 }}
                >
                  Supporting Document (Optional)
                </Typography>
                <Box sx={styles.uploadBox}>
                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="transaction-file-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="transaction-file-upload">
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
                        Click to upload supporting document
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 0.5 }}
                      >
                        PDF, DOC, DOCX, or image files
                      </Typography>
                    </Box>
                  </label>
                </Box>

                {/* Display uploaded file */}
                {formData.supporting_document && (
                  <Box sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        bgcolor: 'rgba(0, 82, 155, 0.05)',
                        borderRadius: 1,
                        border: '1px solid rgba(0, 82, 155, 0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachFileIcon
                          sx={{ mr: 1, color: '#00529B', fontSize: 20 }}
                        />
                        <Typography variant="body2">
                          {formData.supporting_document.name}
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
                  </Box>
                )}
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
              Create Transaction
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Transaction Modal */}
      {selectedTransaction && (
        <ViewTransactionModal
          open={openViewModal}
          handleClose={handleCloseViewModal}
          transaction={selectedTransaction}
        />
      )}

      {/* Acknowledge Transaction Dialog */}
      {selectedTransaction && (
        <AcknowledgeTransactionDialog
          open={openAcknowledgeDialog}
          handleClose={handleCloseAcknowledgeDialog}
          transaction={selectedTransaction}
          onAcknowledge={handleAcknowledgeSubmit}
        />
      )}
    </Box>
  );
};

export default PettyCashTransactions;
