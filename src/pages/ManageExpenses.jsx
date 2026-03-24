import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createPettyCashExpense,
  updatePettyCashExpense,
  deletePettyCashExpense,
  getIssuancePettyCashExpenses,
  approvePettyCashExpense,
  exportApprovedExpenses,
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
  CircularProgress,
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
import ViewExpenseModal from '../components/ViewExpenseModal';
import TrackAndSignPettyCashDialog from '../components/TrackAndSignPettyCashDialog';
import EditExpenseModal from '../components/EditExpenseModal';
import DeleteExpenseDialog from '../components/DeleteExpenseDialog';
import PETTY_CASH_CURRENCIES from '../constants/pettyCashCurrencies';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
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
  headerCell: {
    color: '#00529B',
    fontSize: '14px',
    fontWeight: 600,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

const ManageExpenses = () => {
  const { transactionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const transaction = location.state?.transaction;

  const { issuancePettyCashExpenses, isLoading, isExporting } = useSelector(
    (state) => state.pettyCash,
  );
  const { users: signersData } = useSelector((state) => state.user);

  const signers = signersData?.results || [];
  const expenses = issuancePettyCashExpenses?.results || [];
  const totalCount = issuancePettyCashExpenses?.count || 0;
  const summary = issuancePettyCashExpenses?.summary || null;

  // ── Local state ───────────────────────────────────────────────────────────────

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openTrackSignDialog, setOpenTrackSignDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Create form — supporting_documents is now an array per expense line
  const [formData, setFormData] = useState({
    verifier_id: '',
    expenses: [
      {
        date: '',
        item_description: '',
        amount: '',
        currency: transaction?.currency || 'USD',
        supporting_documents: [],
      },
    ],
  });
  const [currencyError, setCurrencyError] = useState('');

  // ── Data fetching ─────────────────────────────────────────────────────────────

  const refreshList = () => {
    dispatch(getIssuancePettyCashExpenses(transactionId));
  };

  useEffect(() => {
    dispatch(getAllSigners({ is_petty_cash_user: 'true' }));
    refreshList();
  }, [dispatch, transactionId]);

  // ── Pagination ────────────────────────────────────────────────────────────────

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    refreshList();
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    refreshList();
  };

  // ── Create dialog ─────────────────────────────────────────────────────────────

  const handleOpenCreateDialog = () => setOpenCreateDialog(true);

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({
      verifier_id: '',
      expenses: [
        {
          date: '',
          item_description: '',
          amount: '',
          currency: transaction?.currency || 'USD',
          supporting_documents: [],
        },
      ],
    });
    setCurrencyError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseChange = (index, field, value) => {
    const updated = [...formData.expenses];
    updated[index][field] = value;
    if (index === 0 && field === 'currency') {
      updated.forEach((exp, i) => {
        if (i !== 0) exp.currency = value;
      });
    }
    setFormData((prev) => ({ ...prev, expenses: updated }));
  };

  const handleExpenseFileChange = (lineIndex, newFiles) => {
    const updated = [...formData.expenses];
    const existingNames = new Set(
      updated[lineIndex].supporting_documents.map((f) => f.name),
    );
    const unique = newFiles.filter((f) => !existingNames.has(f.name));
    updated[lineIndex] = {
      ...updated[lineIndex],
      supporting_documents: [
        ...updated[lineIndex].supporting_documents,
        ...unique,
      ],
    };
    setFormData((prev) => ({ ...prev, expenses: updated }));
  };

  const handleRemoveExpenseFile = (lineIndex, fileIndex) => {
    const updated = [...formData.expenses];
    updated[lineIndex] = {
      ...updated[lineIndex],
      supporting_documents: updated[lineIndex].supporting_documents.filter(
        (_, i) => i !== fileIndex,
      ),
    };
    setFormData((prev) => ({ ...prev, expenses: updated }));
  };

  const handleAddExpense = () => {
    setFormData((prev) => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        {
          date: '',
          item_description: '',
          amount: '',
          currency:
            transaction?.currency || prev.expenses[0]?.currency || 'USD',
          supporting_documents: [],
        },
      ],
    }));
  };

  const handleRemoveExpense = (index) => {
    if (formData.expenses.length === 1) {
      toast.error('At least one expense is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index),
    }));
  };

  const validateCurrencies = () => {
    const unique = [...new Set(formData.expenses.map((e) => e.currency))];
    if (unique.length > 1) {
      setCurrencyError(
        `All expenses must use the same currency. Please ensure all expenses use ${formData.expenses[0].currency}.`,
      );
      return false;
    }
    setCurrencyError('');
    return true;
  };

  // ── Create submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrencies()) return;

    const payload = new FormData();
    payload.append('petty_cash_id', transactionId);
    payload.append('verifier_id', formData.verifier_id);

    const expensesData = formData.expenses.map((exp) => ({
      date: exp.date,
      item_description: exp.item_description,
      amount: exp.amount,
      currency: exp.currency,
    }));
    payload.append('expenses', JSON.stringify(expensesData));

    formData.expenses.forEach((exp, i) => {
      exp.supporting_documents.forEach((file, j) => {
        payload.append(`expense_documents_${i}_${j}`, file);
      });
    });

    const result = await dispatch(createPettyCashExpense(payload));

    if (createPettyCashExpense.fulfilled.match(result)) {
      toast.success('Expense created successfully.');
      handleCloseCreateDialog();
      refreshList();
    } else {
      toast.error(result.payload || 'Failed to create expense.');
    }
  };

  // ── Action handlers ───────────────────────────────────────────────────────────

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setOpenViewModal(true);
  };

  const handleTrackAndSign = (expense) => {
    setSelectedExpense(expense);
    setOpenTrackSignDialog(true);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setOpenEditModal(true);
  };

  const handleDelete = (expense) => {
    setSelectedExpense(expense);
    setOpenDeleteDialog(true);
  };

  // ── Edit submit ───────────────────────────────────────────────────────────────

  const handleEditSubmit = async (id, formDataPayload) => {
    const result = await dispatch(
      updatePettyCashExpense({ id, formData: formDataPayload }),
    );

    if (updatePettyCashExpense.fulfilled.match(result)) {
      toast.success('Expense updated successfully.');
      handleCloseEditModal();
      refreshList();
    } else {
      toast.error(result.payload || 'Failed to update expense.');
    }
  };

  // ── Delete confirm ────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async (id, comment) => {
    const result = await dispatch(deletePettyCashExpense({ id, comment }));

    if (deletePettyCashExpense.fulfilled.match(result)) {
      toast.success('Expense deleted successfully.');
      handleCloseDeleteDialog();
      refreshList();
    } else {
      toast.error(result.payload || 'Failed to delete expense.');
    }
  };

  // ── Approve/Deny/Rollback ─────────────────────────────────────────────────────

  const handleApprove = () => {
    refreshList();
  };

  // ── Export CSV ────────────────────────────────────────────────────────────────

  const handleExportCSV = async () => {
    try {
      const result = await dispatch(exportApprovedExpenses(transactionId));

      if (exportApprovedExpenses.rejected.match(result)) {
        toast.error(result.payload || 'Failed to export expenses.');
        return;
      }

      const response = result.payload;

      const disposition = response.headers?.['content-disposition'] || '';
      const filenameMatch = disposition.match(
        /filename[^;=\n]*=(['"]?)([^'";\n]+)\1/,
      );
      const filename = filenameMatch
        ? filenameMatch[2].trim()
        : `approved-expenses-${transactionId}-${new Date().toISOString().split('T')[0]}.csv`;

      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'text/csv;charset=utf-8;',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Approved expenses exported successfully.');
    } catch {
      toast.error('An unexpected error occurred during export.');
    }
  };

  // ── Close handlers ────────────────────────────────────────────────────────────

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedExpense(null);
  };
  const handleCloseTrackSignDialog = () => {
    setOpenTrackSignDialog(false);
    setSelectedExpense(null);
    refreshList();
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedExpense(null);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedExpense(null);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getStatusChip = (status) => {
    const map = {
      pending: { bgcolor: '#FFA726', color: 'white' },
      approved: { bgcolor: '#66BB6A', color: 'white' },
      denied: { bgcolor: '#EF5350', color: 'white' },
      verified: { bgcolor: '#42A5F5', color: 'white' },
      rolled_back: { bgcolor: '#9E9E9E', color: 'white' },
      'to verify': { bgcolor: '#42A5F5', color: 'white' },
      'to sign': { bgcolor: '#FF9800', color: 'white' },
    };
    const display = (status || 'N/A')
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return (
      <Chip
        label={display}
        size="small"
        sx={{
          ...(map[status?.toLowerCase()] || {
            bgcolor: '#9E9E9E',
            color: 'white',
          }),
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

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <RootLayout>
      <Box>
        {/* Page header */}
        <Box sx={styles.header}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/petty-cash')}
              sx={{
                bgcolor: 'rgba(0, 82, 155, 0.1)',
                '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.2)' },
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
                {transaction?.holder?.lastname} —{' '}
                {formatAmount(transaction?.amount)} {transaction?.currency}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={
                isExporting ? (
                  <CircularProgress size={16} sx={{ color: '#00529B' }} />
                ) : (
                  <DownloadIcon />
                )
              }
              onClick={handleExportCSV}
              disabled={isExporting}
              sx={{
                borderColor: '#00529B',
                color: '#00529B',
                '&:hover': {
                  borderColor: '#003d73',
                  bgcolor: 'rgba(0, 82, 155, 0.05)',
                },
                '&.Mui-disabled': {
                  borderColor: 'rgba(0, 82, 155, 0.3)',
                  color: 'rgba(0, 82, 155, 0.4)',
                },
                textTransform: 'none',
                minWidth: 130,
              }}
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{
                bgcolor: '#00529B',
                '&:hover': { bgcolor: '#003d73' },
                textTransform: 'none',
                px: 3,
              }}
            >
              Add Expense
            </Button>
          </Box>
        </Box>

        {/* Summary Card */}
        {summary && (
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2.5,
              border: '1px solid rgba(0, 82, 155, 0.15)',
              borderRadius: 2,
              bgcolor: 'rgba(0, 82, 155, 0.02)',
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              sx={{ mb: 2 }}
            >
              Transaction Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Total Expenses
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#d32f2f">
                  {formatAmount(summary.total_expenses)}{' '}
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {summary.currency}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Petty Cash Amount
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#00529B">
                  {formatAmount(summary.petty_cash_amount)}{' '}
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {summary.currency}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Remaining Amount
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={
                    parseFloat(summary.remaining_amount) <= 0
                      ? '#d32f2f'
                      : '#66BB6A'
                  }
                >
                  {formatAmount(summary.remaining_amount)}{' '}
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {summary.currency}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Utilization
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#FF9800">
                  {parseFloat(summary.petty_cash_amount) > 0
                    ? (
                        (parseFloat(summary.total_expenses) /
                          parseFloat(summary.petty_cash_amount)) *
                        100
                      ).toFixed(1)
                    : '0.0'}
                  %
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Expenses table */}
        <Paper elevation={2} sx={{ mt: 3 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" color="#00529B" fontWeight={600}>
              Expenses
            </Typography>
          </Box>

          <TableContainer
            sx={{
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 180px)',
            }}
          >
            <Table sx={{ tableLayout: 'fixed', minWidth: 900 }} stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
                  <TableCell sx={{ ...styles.headerCell, width: '50px' }}>
                    #
                  </TableCell>
                  <TableCell sx={{ ...styles.headerCell, width: '120px' }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ ...styles.headerCell }}>
                    Item Description
                  </TableCell>
                  <TableCell sx={{ ...styles.headerCell, width: '130px' }}>
                    Amount
                  </TableCell>
                  <TableCell sx={{ ...styles.headerCell, width: '90px' }}>
                    Currency
                  </TableCell>
                  <TableCell sx={{ ...styles.headerCell, width: '110px' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ ...styles.headerCell, width: '150px' }}>
                    Created At
                  </TableCell>
                  <TableCell
                    sx={{ ...styles.headerCell, width: '160px' }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} sx={{ color: '#00529B' }} />
                    </TableCell>
                  </TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 3, color: 'text.secondary' }}
                    >
                      No expenses found for this transaction
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense, index) => (
                    <TableRow
                      key={expense.id}
                      hover
                      sx={{ '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.02)' } }}
                    >
                      <TableCell sx={{ width: '50px' }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell sx={{ width: '120px' }}>
                        {expense.date || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={expense.item_description || ''}
                          arrow
                          placement="top"
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {expense.item_description || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ width: '130px' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatAmount(expense.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '90px' }}>
                        <Chip
                          label={expense.currency || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: '#00529B',
                            color: 'white',
                            fontWeight: 500,
                            minWidth: 50,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ width: '110px' }}>
                        {getStatusChip(expense.status)}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: '150px',
                          fontSize: '0.82rem',
                          color: 'text.secondary',
                        }}
                      >
                        {expense.created_at
                          ? new Date(expense.created_at).toLocaleString(
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
                      <TableCell
                        align="center"
                        sx={{ width: '160px', whiteSpace: 'nowrap' }}
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
                              onClick={() => handleView(expense)}
                              sx={{ color: '#00529B', padding: '6px' }}
                            >
                              <VisibilityOutlinedIcon
                                sx={{ fontSize: '1.1rem' }}
                              />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(expense)}
                              sx={{ color: '#FFA726', padding: '6px' }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Track & Sign" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleTrackAndSign(expense)}
                              sx={{ color: '#42A5F5', padding: '6px' }}
                            >
                              <TrackChangesIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(expense)}
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
        </Paper>

        {/* Create Expense Dialog */}
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
            <Typography variant="h6" fontWeight={600}>
              Add Expense
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseCreateDialog}
              size="small"
              disabled={isLoading}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={3}>
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
                          '& .MuiSelect-select': { py: 2 },
                        }}
                        MenuProps={{
                          PaperProps: { style: { maxHeight: 400 } },
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Select a verifier from the list</em>
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
                                  {signer.position} • {signer.department}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="" disabled>
                            <em>Loading verifiers...</em>
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                {/* Expense lines */}
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }} />
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
                              handleExpenseChange(
                                index,
                                'amount',
                                e.target.value,
                              )
                            }
                            required
                            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth required size="small">
                            <InputLabel>Currency</InputLabel>
                            <Select
                              value={expense.currency}
                              label="Currency"
                              disabled
                            >
                              {PETTY_CASH_CURRENCIES.map((curr) => (
                                <MenuItem key={curr.code} value={curr.code}>
                                  {curr.symbol} {curr.code} — {curr.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            Currency is fixed to the transaction currency
                          </Typography>
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

                        {/* Supporting Documents */}
                        <Grid item xs={12}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#00529B',
                              fontWeight: 600,
                              mb: 1,
                              display: 'block',
                            }}
                          >
                            Supporting Documents (Optional)
                          </Typography>

                          <Box sx={styles.uploadBox}>
                            <input
                              accept="*/*"
                              style={{ display: 'none' }}
                              id={`expense-file-${index}`}
                              type="file"
                              multiple
                              onChange={(e) => {
                                handleExpenseFileChange(
                                  index,
                                  Array.from(e.target.files),
                                );
                                e.target.value = '';
                              }}
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
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {expense.supporting_documents.length > 0
                                    ? 'Click to add more documents'
                                    : 'Click to upload receipts'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{ mt: 0.25 }}
                                >
                                  Multiple files allowed
                                </Typography>
                              </Box>
                            </label>
                          </Box>

                          {expense.supporting_documents.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {expense.supporting_documents.map(
                                (file, fileIndex) => (
                                  <Box
                                    key={fileIndex}
                                    sx={{
                                      mt: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      p: 1,
                                      bgcolor: 'rgba(0, 82, 155, 0.05)',
                                      borderRadius: 1,
                                      border:
                                        '1px solid rgba(0, 82, 155, 0.15)',
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <AttachFileIcon
                                        sx={{
                                          mr: 1,
                                          color: '#00529B',
                                          fontSize: 18,
                                        }}
                                      />
                                      <Typography variant="caption">
                                        {file.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ ml: 0.75 }}
                                      >
                                        ({(file.size / 1024).toFixed(1)} KB)
                                      </Typography>
                                    </Box>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleRemoveExpenseFile(
                                          index,
                                          fileIndex,
                                        )
                                      }
                                      sx={{ color: '#d32f2f' }}
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                ),
                              )}
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
              <Button
                onClick={handleCloseCreateDialog}
                disabled={isLoading}
                sx={{ color: '#666', textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={18} sx={{ color: 'white' }} />
                  ) : null
                }
                sx={{
                  bgcolor: '#00529B',
                  '&:hover': { bgcolor: '#003d73' },
                  textTransform: 'none',
                  minWidth: 150,
                  px: 4,
                }}
              >
                {isLoading ? 'Submitting...' : 'Submit Expense'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Modals */}
        {selectedExpense && (
          <>
            <ViewExpenseModal
              open={openViewModal}
              handleClose={handleCloseViewModal}
              expense={selectedExpense}
            />
            <TrackAndSignPettyCashDialog
              open={openTrackSignDialog}
              handleClose={handleCloseTrackSignDialog}
              request={selectedExpense}
              onApprove={handleApprove}
            />
            <EditExpenseModal
              open={openEditModal}
              handleClose={handleCloseEditModal}
              request={selectedExpense}
              onUpdate={handleEditSubmit}
              signers={signers}
              currencies={PETTY_CASH_CURRENCIES}
            />
            <DeleteExpenseDialog
              open={openDeleteDialog}
              handleClose={handleCloseDeleteDialog}
              request={selectedExpense}
              onDelete={handleDeleteConfirm}
            />
          </>
        )}
      </Box>
    </RootLayout>
  );
};

export default ManageExpenses;
