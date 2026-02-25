import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  issuePettyCash,
  getAllPettyCash,
  acknowledgePettyCash,
  updatePettyCash,
  deletePettyCash,
  rollbackPettyCash,
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
  Divider,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import UndoIcon from '@mui/icons-material/Undo';
import { useNavigate } from 'react-router-dom';
import ViewTransactionModal from './ViewTransactionModal';
import AcknowledgeTransactionDialog from './AcknowledgeTransactionDialog';
import EditTransactionModal from './EditTransactionModal';
import DeleteTransactionDialog from './DeleteTransactionDialog';
import RollbackTransactionDialog from './RollbackTransactionDialog';

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
  // Shared with EditTransactionModal
  section: {
    mb: 3,
    p: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
    borderRadius: 1,
  },
  fieldContainer: {
    mb: 2,
  },
  fieldLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#666',
    mb: 0.5,
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

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
];

const PettyCashTransactions = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openAcknowledgeDialog, setOpenAcknowledgeDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRollbackDialog, setOpenRollbackDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pettyCashList, isLoading } = useSelector((state) => state.pettyCash);
  const { users: signersData } = useSelector((state) => state.user);

  const [transactions, setTransactions] = useState([]);
  const signers = signersData?.results || [];
  const totalCount = pettyCashList?.count || 0;

  const refreshList = () => {
    dispatch(getAllPettyCash({ page: page + 1 }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    dispatch(getAllPettyCash({ page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    dispatch(getAllPettyCash({ page: 1 }));
  };

  useEffect(() => {
    dispatch(getAllPettyCash({ page: 1 }));
    dispatch(getAllSigners({ is_petty_cash_user: 'true' }));
  }, [dispatch]);

  useEffect(() => {
    if (pettyCashList?.results) {
      setTransactions(pettyCashList.results);
    }
  }, [pettyCashList]);

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    holder_id: '',
    issue_date: '',
    notes: '',
    supporting_document: null,
  });

  const handleOpenDialog = () => setOpenDialog(true);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      amount: '',
      currency: 'USD',
      holder_id: '',
      issue_date: '',
      notes: '',
      supporting_document: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, supporting_document: file }));
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, supporting_document: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append('holder_id', formData.holder_id);
    submitData.append('amount', formData.amount);
    submitData.append('currency', formData.currency);
    submitData.append('issue_date', formData.issue_date);
    submitData.append('notes', formData.notes);
    if (formData.supporting_document) {
      submitData.append('supporting_document', formData.supporting_document);
    }

    try {
      await dispatch(issuePettyCash(submitData)).unwrap();
      toast.success('Petty cash issued successfully');
      handleCloseDialog();
      refreshList();
    } catch (error) {
      toast.error(error || 'Failed to issue petty cash');
    }
  };

  // ── Action handlers ──────────────────────────────────────────

  const handleView = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenViewModal(true);
  };

  const handleAcknowledge = (transaction) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('User not found. Please log in again.');
      return;
    }
    const loggedInUser = JSON.parse(userStr);
    if (loggedInUser.id !== transaction.holder?.id) {
      toast.error('Only the transaction holder can acknowledge receipt');
      return;
    }
    if (transaction.is_acknowledged) {
      toast.warning('This transaction has already been acknowledged');
      return;
    }
    if (transaction.status !== 'pending_acknowledgment') {
      toast.error('This transaction is not pending acknowledgment');
      return;
    }
    setSelectedTransaction(transaction);
    setOpenAcknowledgeDialog(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenEditModal(true);
  };

  const handleDelete = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  const handleAddExpenses = (transaction) => {
    navigate(`/manage-expenses/${transaction.id}`, { state: { transaction } });
  };

  const handleRequestPettyCash = (transaction) => {
    navigate(`/request-petty-cash/${transaction.id}`, {
      state: { transaction },
    });
  };

  const handleRollback = (transaction) => {
    if (transaction.status === 'pending_acknowledgment') {
      toast.error('Cannot rollback a transaction pending acknowledgment');
      return;
    }
    if (transaction.status === 'exhausted') {
      toast.error('Cannot rollback an exhausted transaction');
      return;
    }
    setSelectedTransaction(transaction);
    setOpenRollbackDialog(true);
  };

  // ── Submit handlers ──────────────────────────────────────────

  const handleAcknowledgeSubmit = async (id, comment) => {
    try {
      await dispatch(
        acknowledgePettyCash({
          id,
          formData: { acknowledgment_notes: comment },
        }),
      ).unwrap();
      toast.success('Transaction acknowledged successfully');
      handleCloseAcknowledgeDialog();
      refreshList();
    } catch (error) {
      toast.error(error || 'Failed to acknowledge transaction');
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await dispatch(deletePettyCash(id)).unwrap();
      toast.success('Transaction deleted successfully');
      handleCloseDeleteDialog();
      refreshList();
    } catch (error) {
      toast.error(error || 'Failed to delete transaction');
    }
  };

  const handleRollbackSuccess = () => {
    handleCloseRollbackDialog();
    refreshList();
  };

  // ── Close handlers ───────────────────────────────────────────

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedTransaction(null);
  };
  const handleCloseAcknowledgeDialog = () => {
    setOpenAcknowledgeDialog(false);
    setSelectedTransaction(null);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedTransaction(null);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTransaction(null);
  };
  const handleCloseRollbackDialog = () => {
    setOpenRollbackDialog(false);
    setSelectedTransaction(null);
  };

  // ── Helpers ──────────────────────────────────────────────────

  const getStatusChip = (status) => {
    const statusColors = {
      active: { bgcolor: '#66BB6A', color: 'white' },
      exhausted: { bgcolor: '#EF5350', color: 'white' },
      pending: { bgcolor: '#FFA726', color: 'white' },
      pending_acknowledgment: { bgcolor: '#FF9800', color: 'white' },
    };
    return (
      <Chip
        label={
          status
            ? status
                .split('_')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
            : 'N/A'
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

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));

  // ── Render ───────────────────────────────────────────────────

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
            '&:hover': { bgcolor: '#003d73' },
            textTransform: 'none',
            px: 3,
          }}
        >
          Create Transaction
        </Button>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{ overflowX: 'auto' }}
      >
        <Table sx={{ ...styles.table, tableLayout: 'fixed', minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
              <TableCell sx={{ ...styles.headerCell, width: '40px' }}>
                #
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '120px' }}>
                Holder
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '90px' }}>
                Amount
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '80px' }}>
                Currency
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '90px' }}>
                Remaining
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '100px' }}>
                Issue Date
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '130px' }}>
                Created At
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '100px' }}>
                Status
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '100px' }}>
                Acknowledged
              </TableCell>
              <TableCell
                sx={{ ...styles.headerCell, minWidth: '300px' }}
                align="center"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction, index) => (
                <TableRow
                  key={transaction.id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.02)' } }}
                >
                  <TableCell sx={{ width: '40px' }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '120px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {transaction.holder?.firstname}{' '}
                    {transaction.holder?.lastname}
                  </TableCell>
                  <TableCell sx={{ width: '90px' }}>
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell sx={{ width: '80px' }}>
                    <Chip
                      label={transaction.currency || 'USD'}
                      size="small"
                      sx={{
                        bgcolor: '#00529B',
                        color: 'white',
                        fontWeight: 500,
                        minWidth: '60px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: '90px' }}>
                    {formatAmount(transaction.remaining_amount)}
                  </TableCell>
                  <TableCell sx={{ width: '100px' }}>
                    {transaction.issue_date}
                  </TableCell>
                  <TableCell sx={{ width: '130px', fontSize: '0.85rem' }}>
                    {transaction.created_at
                      ? new Date(transaction.created_at).toLocaleString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )
                      : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ width: '100px' }}>
                    {getStatusChip(transaction.status)}
                  </TableCell>
                  <TableCell sx={{ width: '100px' }}>
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
                  <TableCell
                    align="center"
                    sx={{ minWidth: '300px', whiteSpace: 'nowrap' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Tooltip title="View" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleView(transaction)}
                          sx={{ color: '#00529B', padding: '6px' }}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Acknowledge" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleAcknowledge(transaction)}
                          sx={{ color: '#66BB6A', padding: '6px' }}
                        >
                          <CheckCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(transaction)}
                          sx={{ color: '#FFA726', padding: '6px' }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Expenses" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleAddExpenses(transaction)}
                          sx={{ color: '#42A5F5', padding: '6px' }}
                        >
                          <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Request Petty Cash" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleRequestPettyCash(transaction)}
                          sx={{ color: '#9C27B0', padding: '6px' }}
                        >
                          <RequestQuoteIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rollback" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleRollback(transaction)}
                          sx={{ color: '#FF9800', padding: '6px' }}
                        >
                          <UndoIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(transaction)}
                          sx={{ color: '#EF5350', padding: '6px' }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
              { mb: 0 },
          }}
        />
      </TableContainer>

      {/* ── Create Transaction Dialog ── */}
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
          <Typography variant="h6" fontWeight={600}>
            Create Transaction
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
          <DialogContent sx={{ pt: 3 }}>
            {/* Holder Section */}
            <Paper elevation={0} sx={styles.section}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#00529B"
                gutterBottom
              >
                Petty Cash Holder
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(0, 82, 155, 0.03)',
                  borderRadius: 2,
                  border: '2px solid rgba(0, 82, 155, 0.1)',
                }}
              >
                <Typography
                  variant="subtitle2"
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
                      '& .MuiSelect-select': { py: 2 },
                    }}
                    MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select a holder from the list</em>
                    </MenuItem>
                    {signers.length > 0 ? (
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
                        <em>Loading holders...</em>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* Transaction Details Section */}
            <Paper elevation={0} sx={styles.section}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#00529B"
                gutterBottom
              >
                Transaction Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                {/* Amount */}
                <Grid item xs={12} md={4}>
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Amount *</Typography>
                    <TextField
                      fullWidth
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      placeholder="e.g., 500.00"
                    />
                  </Box>
                </Grid>

                {/* Currency */}
                <Grid item xs={12} md={4}>
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Currency *</Typography>
                    <FormControl fullWidth required>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        label="Currency"
                      >
                        {CURRENCIES.map((curr) => (
                          <MenuItem key={curr.code} value={curr.code}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                    </FormControl>
                  </Box>
                </Grid>

                {/* Issue Date */}
                <Grid item xs={12} md={4}>
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Issue Date *</Typography>
                    <TextField
                      fullWidth
                      name="issue_date"
                      type="date"
                      value={formData.issue_date}
                      onChange={handleInputChange}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>
                      Notes / Purpose
                    </Typography>
                    <TextField
                      fullWidth
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      placeholder="Describe the purpose of this petty cash issuance..."
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Supporting Document Section */}
            <Paper elevation={0} sx={{ ...styles.section, mb: 0 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#00529B"
                gutterBottom
              >
                Supporting Document
              </Typography>
              <Divider sx={{ mb: 2 }} />

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

              {formData.supporting_document && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    mt: 2,
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
              )}
            </Paper>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
            <Button
              onClick={handleCloseDialog}
              disabled={isLoading}
              sx={{ color: '#666', textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: '#00529B',
                '&:hover': { bgcolor: '#003d73' },
                textTransform: 'none',
                minWidth: 150,
              }}
            >
              {isLoading ? 'Creating...' : 'Create Transaction'}
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

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <EditTransactionModal
          open={openEditModal}
          handleClose={handleCloseEditModal}
          transaction={selectedTransaction}
          onSuccess={() => {
            handleCloseEditModal();
            refreshList();
          }}
          signers={signers}
        />
      )}

      {/* Delete Transaction Dialog */}
      {selectedTransaction && (
        <DeleteTransactionDialog
          open={openDeleteDialog}
          handleClose={handleCloseDeleteDialog}
          transaction={selectedTransaction}
          onDelete={handleDeleteConfirm}
        />
      )}

      {/* Rollback Transaction Dialog */}
      {selectedTransaction && (
        <RollbackTransactionDialog
          open={openRollbackDialog}
          handleClose={handleCloseRollbackDialog}
          transaction={selectedTransaction}
          onSuccess={handleRollbackSuccess}
        />
      )}
    </Box>
  );
};

export default PettyCashTransactions;
