import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createPettyCashReplenishRequest,
  getPettyCashIssuanceRequests,
  updatePettyCashReplenishRequest,
  deletePettyCashReplenishRequest,
  trackPettyCashReplenishRequest,
  approvePettyCashRequest,
} from '../features/pettyCash/pettyCashSlice';
import http from '../http-common';
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
  Tooltip,
  TablePagination,
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
import RootLayout from '../layouts/RootLayout';
import ViewRequestPettyCashModal from '../components/ViewRequestPettyCashModal';
import TrackAndSignPettyCashDialog from '../components/TrackAndSignPettyCashDialog';
import EditRequestPettyCashModal from '../components/EditRequestPettyCashModal';
import DeleteRequestPettyCashDialog from '../components/DeleteRequestPettyCashDialog';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
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

const RequestPettyCash = () => {
  const { transactionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const transaction = location.state?.transaction;

  const { issuanceRequests, isLoading } = useSelector(
    (state) => state.pettyCash,
  );

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    verifier_id: '',
    expenses_csv: null,
    amount: '',
    description: 'Replenishment',
    comment: '',
    supporting_documents: [],
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openTrackSignDialog, setOpenTrackSignDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Verifiers: fetched via parallel HTTP calls on mount
  const [signers, setSigners] = useState([]);
  const [loadingVerifiers, setLoadingVerifiers] = useState(false);

  // ── Logged-in user & permission ──────────────────────────────────────────
  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  const isCustodian = loggedInUser?.is_custodian === true;

  const requests =
    issuanceRequests?.requests ??
    issuanceRequests?.results ??
    (Array.isArray(issuanceRequests) ? issuanceRequests : []);
  const totalCount =
    issuanceRequests?.total_requests ??
    issuanceRequests?.count ??
    requests.length;

  // ── Data fetching ──────────────────────────────────────────────────────────

  const refreshList = (p = 1) => {
    dispatch(
      getPettyCashIssuanceRequests({
        id: transactionId,
        params: { page: p },
      }),
    );
  };

  useEffect(() => {
    refreshList(1);

    // Fetch verifiers: is_first_approver=true, is_petty_cash_user=true,
    // is_approved=true, role=signer AND role=signer_admin (two parallel calls)
    const fetchVerifiers = async () => {
      setLoadingVerifiers(true);
      try {
        const [signerRes, signerAdminRes] = await Promise.all([
          http.get('/auth/user-list/', {
            params: {
              is_first_approver: true,
              is_petty_cash_user: true,
              is_approved: true,
              role: 'signer',
            },
          }),
          http.get('/auth/user-list/', {
            params: {
              is_first_approver: true,
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
        setSigners(unique);
      } catch (err) {
        console.error('Failed to fetch verifiers:', err);
        setSigners([]);
      } finally {
        setLoadingVerifiers(false);
      }
    };

    fetchVerifiers();
  }, [dispatch, transactionId]);

  // ── Pagination ─────────────────────────────────────────────────────────────

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refreshList(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    refreshList(1);
  };

  // ── Form handlers ──────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please upload a valid CSV file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        const lines = csvText.split('\n').filter((line) => line.trim());
        if (lines.length <= 1) {
          toast.error('CSV file is empty or invalid');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const amountIndex = headers.indexOf('amount');

        if (amountIndex === -1) {
          toast.error('CSV does not contain an "amount" column');
          return;
        }

        let total = 0;
        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',');
          const amount = parseFloat(columns[amountIndex]) || 0;
          total += amount;
        }

        setFormData({
          ...formData,
          expenses_csv: file,
          amount: total.toFixed(2),
        });
        toast.success(`CSV uploaded. Total amount: $${total.toFixed(2)}`);
      };
      reader.onerror = () => toast.error('Error reading CSV file');
      reader.readAsText(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, expenses_csv: null, amount: '' });
  };

  const handleSupportingDocUpload = (e) => {
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

  const handleRemoveSupportingDoc = (index) => {
    setFormData((prev) => ({
      ...prev,
      supporting_documents: prev.supporting_documents.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleOpenCreateDialog = () => {
    if (!isCustodian) {
      toast.error(
        'You do not have permission to create petty cash requests. Only custodians can submit requests.',
      );
      return;
    }
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({
      verifier_id: '',
      expenses_csv: null,
      amount: '',
      description: 'Replenishment',
      comment: '',
      supporting_documents: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('related_petty_cash_id', transactionId);
      submitData.append('verifier_id', formData.verifier_id);
      submitData.append('amount', formData.amount);
      submitData.append('comment', formData.comment);
      if (formData.expenses_csv) {
        submitData.append('expenses_file', formData.expenses_csv);
      }
      formData.supporting_documents.forEach((file) => {
        submitData.append('supporting_documents', file);
      });

      await dispatch(createPettyCashReplenishRequest(submitData)).unwrap();
      toast.success('Petty cash request created successfully');
      handleCloseCreateDialog();
      refreshList(1);
    } catch (error) {
      toast.error(error || 'Failed to create petty cash request');
    }
  };

  // ── Action handlers ────────────────────────────────────────────────────────

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

  const handleEditSubmit = async (id, updatedFormData) => {
    try {
      await dispatch(
        updatePettyCashReplenishRequest({ id, formData: updatedFormData }),
      ).unwrap();
      toast.success('Request updated successfully');
      setOpenEditModal(false);
      setSelectedRequest(null);
      refreshList(1);
    } catch (error) {
      toast.error(error || 'Failed to update request');
    }
  };

  const handleDeleteConfirm = async (id, comment) => {
    try {
      await dispatch(deletePettyCashReplenishRequest({ id, comment })).unwrap();
      toast.success('Request deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedRequest(null);
      refreshList(1);
    } catch (error) {
      toast.error(error || 'Failed to delete request');
    }
  };

  const handleApprove = () => {
    refreshList(1);
  };

  // ── Close handlers ─────────────────────────────────────────────────────────

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedRequest(null);
  };
  const handleCloseTrackSignDialog = () => {
    setOpenTrackSignDialog(false);
    setSelectedRequest(null);
    refreshList(page + 1);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedRequest(null);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedRequest(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

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
        label={displayStatus
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
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

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <RootLayout>
      <Box>
        {/* Header */}
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
                Request Petty Cash
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transaction: {transaction?.holder?.firstname}{' '}
                {transaction?.holder?.lastname} - $
                {formatAmount(transaction?.amount)} {transaction?.currency}
              </Typography>
            </Box>
          </Box>

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
            Create Request
          </Button>
        </Box>

        {/* Requests Table */}
        <Paper elevation={2}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" color="#00529B" fontWeight={600}>
              Petty Cash Requests
            </Typography>
          </Box>

          <TableContainer
            sx={{
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 180px)',
            }}
          >
            <Table sx={{ tableLayout: 'fixed', minWidth: 800 }} stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
                  <TableCell sx={{ ...styles.headerCell, width: '40px' }}>
                    #
                  </TableCell>
                  <TableCell sx={{ ...styles.headerCell, width: '160px' }}>
                    Requester
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
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      No petty cash requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request, index) => (
                    <TableRow
                      key={request.id}
                      hover
                      sx={{ '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.02)' } }}
                    >
                      <TableCell sx={{ width: '40px' }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: '160px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {request.requester?.firstname}{' '}
                        {request.requester?.lastname}
                      </TableCell>
                      <TableCell sx={{ width: '130px' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {request.currency === 'USD' ? '$' : ''}
                          {formatAmount(request.total_expenses)}{' '}
                          {request.currency !== 'USD' ? request.currency : ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '90px' }}>
                        <Chip
                          label={request.currency || 'USD'}
                          size="small"
                          sx={{
                            bgcolor: '#00529B',
                            color: 'white',
                            fontWeight: 500,
                            minWidth: '50px',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ width: '110px' }}>
                        {getStatusChip(request.status)}
                      </TableCell>
                      <TableCell sx={{ width: '150px', fontSize: '0.82rem' }}>
                        {request.created_at
                          ? new Date(request.created_at).toLocaleString(
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
                              onClick={() => handleView(request)}
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
                              onClick={() => handleEdit(request)}
                              sx={{ color: '#FFA726', padding: '6px' }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Track & Sign" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleTrackAndSign(request)}
                              sx={{ color: '#42A5F5', padding: '6px' }}
                            >
                              <TrackChangesIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(request)}
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

        {/* Create Request Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={handleCloseCreateDialog}
          maxWidth="sm"
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
            <Typography variant="h6">Create Petty Cash Request</Typography>
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
                      sx={{ color: '#00529B', fontWeight: 600, mb: 1.5 }}
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
                        disabled={loadingVerifiers}
                      >
                        <MenuItem value="" disabled>
                          {loadingVerifiers ? (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <CircularProgress size={14} />
                              <em>Loading verifiers...</em>
                            </Box>
                          ) : (
                            <em>Select a verifier</em>
                          )}
                        </MenuItem>
                        {!loadingVerifiers && signers.length === 0 && (
                          <MenuItem value="" disabled>
                            <em>No eligible verifiers found</em>
                          </MenuItem>
                        )}
                        {signers.map((signer) => (
                          <MenuItem key={signer.id} value={signer.id}>
                            {signer.firstname} {signer.lastname} —{' '}
                            {signer.position}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                {/* CSV Upload */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#00529B', fontWeight: 600, mb: 1 }}
                  >
                    Upload Expenses CSV *
                  </Typography>
                  <Box sx={styles.uploadBox}>
                    <input
                      accept=".csv"
                      style={{ display: 'none' }}
                      id="csv-upload"
                      type="file"
                      onChange={handleFileUpload}
                      required
                    />
                    <label htmlFor="csv-upload">
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
                          Click to upload expenses CSV
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ mt: 0.5 }}
                        >
                          Download CSV from Manage Expenses page
                        </Typography>
                      </Box>
                    </label>
                  </Box>
                  {formData.expenses_csv && (
                    <Box
                      sx={{
                        mt: 2,
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
                          {formData.expenses_csv.name}
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
                </Grid>

                {/* Auto-calculated Amount */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    name="amount"
                    value={formData.amount}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                    helperText="Auto-calculated from CSV"
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>

                {/* Comment */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Comment (Optional)"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    placeholder="Add any additional notes..."
                  />
                </Grid>

                {/* Supporting Documents */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#00529B', fontWeight: 600, mb: 1 }}
                  >
                    Supporting Documents (Optional)
                  </Typography>

                  <Box sx={styles.uploadBox}>
                    <input
                      accept="*/*"
                      style={{ display: 'none' }}
                      id="supporting-docs-upload"
                      type="file"
                      multiple
                      onChange={handleSupportingDocUpload}
                    />
                    <label htmlFor="supporting-docs-upload">
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <CloudUploadIcon
                          sx={{ fontSize: 36, color: '#00529B', mb: 1 }}
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
                          PDF, DOC, DOCX, or image files — multiple files
                          allowed
                        </Typography>
                      </Box>
                    </label>
                  </Box>

                  {formData.supporting_documents.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {formData.supporting_documents.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            mt: 1,
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
                              sx={{ mr: 1, color: '#00529B', fontSize: 18 }}
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
                            onClick={() => handleRemoveSupportingDoc(index)}
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
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={handleCloseCreateDialog}
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
                }}
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Modals */}
        {selectedRequest && (
          <>
            <ViewRequestPettyCashModal
              open={openViewModal}
              handleClose={handleCloseViewModal}
              request={selectedRequest}
            />
            <TrackAndSignPettyCashDialog
              open={openTrackSignDialog}
              handleClose={handleCloseTrackSignDialog}
              request={selectedRequest}
              onApprove={handleApprove}
              trackThunk={trackPettyCashReplenishRequest}
              approveThunk={approvePettyCashRequest}
              trackingStateKey="replenishRequestTrackingData"
            />
            <EditRequestPettyCashModal
              open={openEditModal}
              handleClose={handleCloseEditModal}
              request={selectedRequest}
              onUpdate={handleEditSubmit}
              signers={signers}
            />
            <DeleteRequestPettyCashDialog
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

export default RequestPettyCash;
