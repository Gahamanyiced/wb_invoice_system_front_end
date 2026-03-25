import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  issuePettyCash,
  getAllPettyCash,
  acknowledgePettyCash,
  updatePettyCash,
  deletePettyCash,
  rollbackPettyCash,
  getPettyCashLedger,
} from '../features/pettyCash/pettyCashSlice';
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
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import http from '../http-common';
import ViewTransactionModal from './ViewTransactionModal';
import AcknowledgeTransactionDialog from './AcknowledgeTransactionDialog';
import EditTransactionModal from './EditTransactionModal';
import DeleteTransactionDialog from './DeleteTransactionDialog';
import RollbackTransactionDialog from './RollbackTransactionDialog';
import ReplenishTransactionDialog from './ReplenishTransactionDialog';
import PETTY_CASH_CURRENCIES from '../constants/pettyCashCurrencies';

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

// ── CSV generation helper ─────────────────────────────────────────────────────
const generateLedgerCSV = (ledger, transactionId) => {
  const { header, expenses, closing_balance } = ledger;
  const fmt = (val) => (val == null ? '' : val);
  const rows = [];

  rows.push(['RWANDAIR PETTY CASH', '', '', '', '']);
  rows.push([`STATION : ${fmt(header.station)}`, '', '', '', '']);
  rows.push([`PERIOD: ${fmt(header.period)}`, '', '', '', '']);
  rows.push(['', 'Description', 'Dr', 'Cr', 'BALANCE']);
  rows.push([
    'DATE',
    'Opening balance',
    fmt(header.opening_balance.dr),
    fmt(header.opening_balance.cr),
    '',
  ]);
  rows.push([
    '',
    'Replenishment',
    fmt(header.replenishment.dr),
    fmt(header.replenishment.cr),
    '',
  ]);
  rows.push(['', '', '', '', fmt(header.total)]);

  expenses.forEach((exp) => {
    rows.push([
      fmt(exp.date),
      fmt(exp.description),
      fmt(exp.dr),
      fmt(exp.cr),
      fmt(exp.balance),
    ]);
  });

  rows.push(['', 'Closing balance', '', '', fmt(closing_balance)]);

  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(','),
    )
    .join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `petty_cash_ledger_${transactionId}_${header.period?.replace(/\s/g, '_') || 'report'}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// Statuses that allow editing — must be issuer AND one of these statuses
const EDIT_ALLOWED_STATUSES = ['rollback', 'pending_acknowledgment'];

const PettyCashTransactions = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openAcknowledgeDialog, setOpenAcknowledgeDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRollbackDialog, setOpenRollbackDialog] = useState(false);
  const [openReplenishDialog, setOpenReplenishDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [downloadingLedgerId, setDownloadingLedgerId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pettyCashList, isLoading } = useSelector((state) => state.pettyCash);

  const [transactions, setTransactions] = useState([]);
  const [custodians, setCustodians] = useState([]);

  const totalCount = pettyCashList?.count || 0;

  // ── Parse logged-in user once ────────────────────────────────────────────
  const loggedInUser = (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })();

  // ── Role checks ──────────────────────────────────────────────────────────
  const isCustodian = loggedInUser?.is_custodian === true;
  const isExpenseCreator = loggedInUser?.is_expense_creator === true;
  const isApprover = loggedInUser?.is_approver === true;
  const isFirstApprover = loggedInUser?.is_first_approver === true;
  const isSecondApprover = loggedInUser?.is_second_approver === true;
  const isLastApprover = loggedInUser?.is_last_approver === true;
  const isAdmin = loggedInUser?.role === 'admin';

  // View              → everyone (no flag needed)
  // Acknowledge       → custodian only
  const canAcknowledge = isCustodian;
  // Edit              → first approver only
  const canEdit = isFirstApprover;
  // Approve Expenses  → approver | first | second | last approver | custodian | expense creator
  const canApproveExpenses =
    isApprover ||
    isFirstApprover ||
    isSecondApprover ||
    isLastApprover ||
    isCustodian ||
    isExpenseCreator;
  // Approve Replenishment → approver | first | second | last approver | custodian
  const canApproveReplenishment =
    isApprover ||
    isFirstApprover ||
    isSecondApprover ||
    isLastApprover ||
    isCustodian;
  // Rollback          → custodian | first approver | admin
  const canRollback = isCustodian || isFirstApprover || isAdmin;
  // Delete            → first approver only
  const canDelete = isFirstApprover;
  // Top-Up            → first approver only
  const canTopUp = isFirstApprover;
  // Download Ledger   → everyone (no flag needed)

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

    // Fetch custodians via two parallel calls for role=signer and role=signer_admin,
    // all with is_custodian=true, is_petty_cash_user=true, is_approved=true
    const fetchCustodians = async () => {
      try {
        const [signerRes, signerAdminRes] = await Promise.all([
          http.get('/auth/user-list/', {
            params: {
              is_custodian: true,
              is_petty_cash_user: true,
              is_approved: true,
              role: 'signer',
            },
          }),
          http.get('/auth/user-list/', {
            params: {
              is_custodian: true,
              is_petty_cash_user: true,
              is_approved: true,
              role: 'signer_admin',
            },
          }),
        ]);
        const signerResults = signerRes.data?.results ?? signerRes.data ?? [];
        const signerAdminResults =
          signerAdminRes.data?.results ?? signerAdminRes.data ?? [];
        const merged = [...signerResults, ...signerAdminResults];
        const unique = merged.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id),
        );
        setCustodians(unique);
      } catch (err) {
        console.error('Failed to fetch custodians:', err);
      }
    };

    fetchCustodians();
  }, [dispatch]);

  useEffect(() => {
    if (pettyCashList?.results) {
      setTransactions(pettyCashList.results);
    }
  }, [pettyCashList]);

  // ── Create form state ─────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    holder_id: '',
    issue_date: '',
    notes: '',
    supporting_documents: [],
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
      supporting_documents: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => {
      const existingNames = new Set(
        prev.supporting_documents.map((f) => f.name),
      );
      const unique = newFiles.filter((f) => !existingNames.has(f.name));
      return {
        ...prev,
        supporting_documents: [...prev.supporting_documents, ...unique],
      };
    });
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      supporting_documents: prev.supporting_documents.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append('holder_id', formData.holder_id);
    submitData.append('amount', formData.amount);
    submitData.append('currency', formData.currency);
    submitData.append('issue_date', formData.issue_date);
    submitData.append('notes', formData.notes);
    formData.supporting_documents.forEach((file) => {
      submitData.append('supporting_documents', file);
    });

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
    if (!loggedInUser) {
      toast.error('User not found. Please log in again.');
      return;
    }
    if (!isCustodian) {
      toast.error(
        'You do not have permission to acknowledge. Only custodians can acknowledge receipt.',
      );
      return;
    }
    if (loggedInUser.id !== transaction.holder?.id) {
      toast.error('Only the transaction custodian can acknowledge receipt.');
      return;
    }
    if (transaction.is_acknowledged) {
      toast.warning('This transaction has already been acknowledged.');
      return;
    }
    if (transaction.status !== 'pending_acknowledgment') {
      toast.error('This transaction is not pending acknowledgment.');
      return;
    }
    setSelectedTransaction(transaction);
    setOpenAcknowledgeDialog(true);
  };

  const handleEdit = (transaction) => {
    if (!loggedInUser) {
      toast.error('User not found. Please log in again.');
      return;
    }
    if (!canEdit) {
      toast.error(
        'You do not have permission to edit transactions. Only first approvers can edit.',
      );
      return;
    }
    if (!EDIT_ALLOWED_STATUSES.includes(transaction.status)) {
      toast.error(
        'This transaction can only be edited when its status is Rolled Back or Pending Acknowledgment.',
      );
      return;
    }
    setSelectedTransaction(transaction);
    setOpenEditModal(true);
  };

  const handleDelete = (transaction) => {
    if (!loggedInUser) {
      toast.error('User not found. Please log in again.');
      return;
    }
    if (!canDelete) {
      toast.error(
        'You do not have permission to delete transactions. Only first approvers can delete.',
      );
      return;
    }
    setSelectedTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  const handleAddExpenses = (transaction) => {
    if (!loggedInUser) {
      toast.error('User not found. Please log in again.');
      return;
    }
    if (!canApproveExpenses) {
      toast.error('You do not have permission to manage expenses.');
      return;
    }
    navigate(`/manage-expenses/${transaction.id}`, { state: { transaction } });
  };

  const handleRequestPettyCash = (transaction) => {
    if (!loggedInUser) {
      toast.error('User not found. Please log in again.');
      return;
    }
    if (!canApproveReplenishment) {
      toast.error(
        'You do not have permission to manage replenishment requests.',
      );
      return;
    }
    navigate(`/request-petty-cash/${transaction.id}`, {
      state: { transaction },
    });
  };

  const handleRollback = (transaction) => {
    if (!loggedInUser) {
      toast.error('User not found. Please log in again.');
      return;
    }
    if (!canRollback) {
      toast.error(
        'You do not have permission to perform a rollback. Only custodians, first approvers, or admins can rollback.',
      );
      return;
    }
    setSelectedTransaction(transaction);
    setOpenRollbackDialog(true);
  };

  const handleReplenish = (transaction) => {
    if (!loggedInUser) {
      toast.error('User not found. Please log in again.');
      return;
    }
    if (!canTopUp) {
      toast.error(
        'You do not have permission to top up. Only first approvers can top up.',
      );
      return;
    }
    setSelectedTransaction(transaction);
    setOpenReplenishDialog(true);
  };

  // ── Download Ledger ──────────────────────────────────────────

  const handleDownloadLedger = async (transaction) => {
    setDownloadingLedgerId(transaction.id);
    try {
      const result = await dispatch(
        getPettyCashLedger(transaction.id),
      ).unwrap();
      generateLedgerCSV(result, transaction.id);
      toast.success('Ledger report downloaded successfully');
    } catch (error) {
      toast.error(error || 'Failed to download ledger report');
    } finally {
      setDownloadingLedgerId(null);
    }
  };

  // ── Submit handlers ──────────────────────────────────────────

  const handleAcknowledgeSubmit = async (id, comment, expenseCreatorId) => {
    try {
      await dispatch(
        acknowledgePettyCash({
          id,
          formData: {
            acknowledgment_notes: comment,
            expense_creator_id: expenseCreatorId,
          },
        }),
      ).unwrap();
      toast.success('Transaction acknowledged successfully');
      handleCloseAcknowledgeDialog();
      refreshList();
    } catch (error) {
      toast.error(error || 'Failed to acknowledge transaction');
    }
  };

  const handleDeleteConfirm = async (id, comment) => {
    try {
      await dispatch(deletePettyCash({ id, comment })).unwrap();
      toast.success('Transaction deleted successfully');
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      handleCloseDeleteDialog();
    } catch (error) {
      toast.error(error || 'Failed to delete transaction');
    }
  };

  const handleRollbackSuccess = () => {
    handleCloseRollbackDialog();
    refreshList();
  };

  const handleReplenishSuccess = () => {
    handleCloseReplenishDialog();
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
  const handleCloseReplenishDialog = () => {
    setOpenReplenishDialog(false);
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

        {/* Create Transaction — is_first_approver only */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (!canEdit) {
              toast.error(
                'You do not have permission to create transactions. Only first approvers can create.',
              );
              return;
            }
            handleOpenDialog();
          }}
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
        sx={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 150px)',
        }}
      >
        <Table sx={{ ...styles.table, tableLayout: 'fixed', minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
              <TableCell sx={{ ...styles.headerCell, width: '40px' }}>
                #
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '140px' }}>
                Custodian
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '110px' }}>
                Amount
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '90px' }}>
                Currency
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '110px' }}>
                Remaining
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '120px' }}>
                Replenishment
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '140px' }}>
                Created At
              </TableCell>
              <TableCell sx={{ ...styles.headerCell, width: '110px' }}>
                Status
              </TableCell>
              <TableCell
                sx={{ ...styles.headerCell, minWidth: '380px' }}
                align="center"
              >
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
                      width: '140px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {transaction.holder?.firstname}{' '}
                    {transaction.holder?.lastname}
                  </TableCell>
                  <TableCell sx={{ width: '110px' }}>
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell sx={{ width: '90px' }}>
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
                  <TableCell sx={{ width: '110px' }}>
                    {formatAmount(transaction.remaining_amount)}
                  </TableCell>
                  <TableCell sx={{ width: '120px' }}>
                    {transaction.replenishment_amount
                      ? formatAmount(transaction.replenishment_amount)
                      : '—'}
                  </TableCell>
                  <TableCell sx={{ width: '140px', fontSize: '0.85rem' }}>
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
                  <TableCell sx={{ width: '110px' }}>
                    {getStatusChip(transaction.status)}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{ minWidth: '380px', whiteSpace: 'nowrap' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {/* View — everyone */}
                      <Tooltip title="View" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleView(transaction)}
                          sx={{ color: '#00529B', padding: '6px' }}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>

                      {/* Acknowledge */}
                      <Tooltip title="Acknowledge" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleAcknowledge(transaction)}
                          sx={{ color: '#66BB6A', padding: '6px' }}
                        >
                          <CheckCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>

                      {/* Edit */}
                      <Tooltip title="Edit" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(transaction)}
                          sx={{ color: '#FFA726', padding: '6px' }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>

                      {/* Approve Expenses */}
                      <Tooltip title="Approve Expenses" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleAddExpenses(transaction)}
                          sx={{ color: '#42A5F5', padding: '6px' }}
                        >
                          <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>

                      {/* Approve Replenishment */}
                      <Tooltip title="Approve Replenishment" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleRequestPettyCash(transaction)}
                          sx={{ color: '#9C27B0', padding: '6px' }}
                        >
                          <RequestQuoteIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>

                      {/* Rollback */}
                      <Tooltip title="Rollback" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleRollback(transaction)}
                          sx={{ color: '#FF9800', padding: '6px' }}
                        >
                          <UndoIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>

                      {/* Top-Up */}
                      <Tooltip title="Top-Up" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleReplenish(transaction)}
                          sx={{ color: '#00897B', padding: '6px' }}
                        >
                          <CurrencyExchangeIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>

                      {/* Download Ledger Report — everyone */}
                      <Tooltip title="Download Ledger Report" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadLedger(transaction)}
                          disabled={downloadingLedgerId === transaction.id}
                          sx={{
                            color:
                              downloadingLedgerId === transaction.id
                                ? '#bdbdbd'
                                : '#546E7A',
                            padding: '6px',
                          }}
                        >
                          <DownloadIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>

                      {/* Delete */}
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
            {/* Custodian Section */}
            <Paper elevation={0} sx={styles.section}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#00529B"
                gutterBottom
              >
                Petty Cash Custodian
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
                  Select Petty Cash Custodian *
                </Typography>
                <FormControl fullWidth required size="large">
                  <InputLabel sx={{ fontSize: '1.1rem' }}>
                    Choose Custodian
                  </InputLabel>
                  <Select
                    name="holder_id"
                    value={formData.holder_id}
                    onChange={handleInputChange}
                    label="Choose Custodian"
                    sx={{
                      fontSize: '1.1rem',
                      '& .MuiSelect-select': { py: 2 },
                    }}
                    MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select a custodian from the list</em>
                    </MenuItem>
                    {custodians.length > 0 ? (
                      custodians.map((custodian) => (
                        <MenuItem
                          key={custodian.id}
                          value={custodian.id}
                          sx={{ py: 1.5 }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {custodian.firstname} {custodian.lastname}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {custodian.position} • {custodian.department} •{' '}
                              {custodian.section}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        <em>Loading custodians...</em>
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
                        {PETTY_CASH_CURRENCIES.map((curr) => (
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
              </Grid>
              <Box sx={{ ...styles.fieldContainer, mt: 2 }}>
                <Typography sx={styles.fieldLabel}>Notes / Purpose</Typography>
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
            </Paper>

            {/* Supporting Documents Section */}
            <Paper elevation={0} sx={{ ...styles.section, mb: 0 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#00529B"
                gutterBottom
              >
                Supporting Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={styles.uploadBox}>
                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="transaction-file-upload"
                  type="file"
                  multiple
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
                      {formData.supporting_documents.length > 0
                        ? 'Click to add more documents'
                        : 'Click to upload supporting documents'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 0.5 }}
                    >
                      PDF, DOC, DOCX, or image files — multiple files allowed
                    </Typography>
                  </Box>
                </label>
              </Box>

              {formData.supporting_documents.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {formData.supporting_documents.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        mb: 1,
                        bgcolor: 'rgba(0, 82, 155, 0.05)',
                        borderRadius: 1,
                        border: '1px solid rgba(0, 82, 155, 0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachFileIcon
                          sx={{ mr: 1, color: '#00529B', fontSize: 20 }}
                        />
                        <Typography variant="body2">{file.name}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ({(file.size / 1024).toFixed(1)} KB)
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
          signers={custodians}
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
          loggedInUser={loggedInUser}
        />
      )}

      {/* Top-Up Dialog */}
      {selectedTransaction && (
        <ReplenishTransactionDialog
          open={openReplenishDialog}
          handleClose={handleCloseReplenishDialog}
          transaction={selectedTransaction}
          signers={custodians}
          onSuccess={handleReplenishSuccess}
        />
      )}
    </Box>
  );
};

export default PettyCashTransactions;
