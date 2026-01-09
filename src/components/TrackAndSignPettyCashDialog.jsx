import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  trackPettyCashRequest,
  signPettyCashRequest,
  getAllPettyCashRequests,
} from '../features/pettyCash/pettyCashSlice';
import { getAllSigners } from '../features/user/userSlice';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SendIcon from '@mui/icons-material/Send';
import UndoIcon from '@mui/icons-material/Undo';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonIcon from '@mui/icons-material/Person';

const style = {
  dialogPaper: {
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
  },
  header: {
    bgcolor: '#00529B',
    color: 'white',
    p: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    p: 3,
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
  fieldValue: {
    fontSize: '1rem',
    color: '#333',
  },
};

const TrackAndSignPettyCashDialog = ({ open, handleClose, request }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.pettyCash);

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [signAction, setSignAction] = useState('');
  const [signNotes, setSignNotes] = useState('');
  const [showSignForm, setShowSignForm] = useState(false);
  const [selectedSigners, setSelectedSigners] = useState([]);
  const [availableSigners, setAvailableSigners] = useState([]);

  // Get user from localStorage on component mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setLoggedInUser(user);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
  }, []);

  // Fetch tracking data when dialog opens
  useEffect(() => {
    if (open && request) {
      fetchTrackingData();
      fetchSigners();
    }
  }, [open, request]);

  const fetchSigners = async () => {
    try {
      const result = await dispatch(
        getAllSigners({ is_petty_cash_user: 'true' })
      ).unwrap();
      setAvailableSigners(result?.results || []);
    } catch (error) {
      console.error('Failed to fetch signers:', error);
      setAvailableSigners([]);
    }
  };

  const fetchTrackingData = async () => {
    setLoadingTracking(true);
    try {
      const result = await dispatch(trackPettyCashRequest(request.id)).unwrap();
      setTrackingData(result);
    } catch (error) {
      toast.error(error || 'Failed to fetch tracking data');
      setTrackingData({ request: request, request_histories: [] });
    } finally {
      setLoadingTracking(false);
    }
  };

  const handleSignRequest = async () => {
    if (!signAction) {
      toast.error('Please select an action (Approve, Deny, or Rollback)');
      return;
    }

    // Validate notes for deny and rollback
    if (
      (signAction === 'deny' || signAction === 'rollback') &&
      !signNotes.trim()
    ) {
      toast.error('Notes are required for deny and rollback actions');
      return;
    }

    if (signAction === 'approve_and_forward' && selectedSigners.length === 0) {
      toast.error('Please select at least one next signer');
      return;
    }

    try {
      let signData = {};

      if (signAction === 'approve') {
        signData = {
          status: 'signed',
          notes: signNotes || '',
          final_approval: true,
        };
      } else if (signAction === 'approve_and_forward') {
        signData = {
          status: 'signed',
          notes: signNotes || '',
          next_signers: selectedSigners,
        };
      } else if (signAction === 'deny') {
        signData = {
          status: 'denied',
          notes: signNotes || '',
        };
      } else if (signAction === 'rollback') {
        signData = {
          status: 'rollback',
          notes: signNotes || '',
        };
      }

      await dispatch(
        signPettyCashRequest({ id: request.id, data: signData })
      ).unwrap();

      const actionText =
        signAction === 'approve'
          ? 'approved'
          : signAction === 'approve_and_forward'
          ? 'approved and forwarded'
          : signAction === 'deny'
          ? 'denied'
          : 'rolled back';
      toast.success(`Request ${actionText} successfully`);

      await fetchTrackingData();
      dispatch(getAllPettyCashRequests({ page: 1 }));

      setShowSignForm(false);
      setSignAction('');
      setSignNotes('');
      setSelectedSigners([]);
    } catch (error) {
      toast.error(error || 'Failed to sign request');
    }
  };

  const getStatusChip = (status) => {
    const normalizedStatus = status?.toLowerCase().replace(/_/g, ' ');

    const statusConfig = {
      pending: {
        bgcolor: '#FFA726',
        icon: <PendingIcon sx={{ fontSize: 16 }} />,
      },
      approved: {
        bgcolor: '#66BB6A',
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
      },
      denied: {
        bgcolor: '#EF5350',
        icon: <CancelIcon sx={{ fontSize: 16 }} />,
      },
      verified: {
        bgcolor: '#42A5F5',
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
      },
      rolled_back: {
        bgcolor: '#9E9E9E',
        icon: <UndoIcon sx={{ fontSize: 16 }} />,
      },
      'waiting to sign': {
        bgcolor: '#FF9800',
        icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />,
      },
      'to verify': {
        bgcolor: '#42A5F5',
        icon: <VerifiedUserIcon sx={{ fontSize: 16 }} />,
      },
      'to sign': {
        bgcolor: '#FF9800',
        icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />,
      },
    };

    const config = statusConfig[normalizedStatus] || statusConfig.pending;
    const displayStatus = status?.replace(/_/g, ' ');

    return (
      <Chip
        icon={config.icon}
        label={displayStatus?.charAt(0).toUpperCase() + displayStatus?.slice(1)}
        size="small"
        sx={{
          bgcolor: config.bgcolor,
          color: 'white',
          fontWeight: 600,
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const canUserSign = () => {
    if (!trackingData || !loggedInUser) return false;
    const canSign = trackingData.request_histories?.some((history) => {
      const statusLower = history.status?.toLowerCase().replace(/_/g, ' ');
      return (
        history.user?.id === loggedInUser.id &&
        (statusLower === 'to verify' || statusLower === 'to sign')
      );
    });
    return canSign;
  };

  const currentRequest = trackingData?.request || request;

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <Box sx={style.header}>
        <Typography variant="h6" fontWeight={600}>
          Track & Sign Request
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={style.content}>
        {/* Request Summary */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#00529B"
            gutterBottom
          >
            Request Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Status</Typography>
                {getStatusChip(currentRequest.status)}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Currency</Typography>
                <Chip
                  label={currentRequest.currency || 'USD'}
                  size="small"
                  sx={{
                    bgcolor: '#00529B',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Total Expenses</Typography>
                <Typography
                  sx={style.fieldValue}
                  fontWeight={700}
                  color="#00529B"
                >
                  {formatAmount(currentRequest.total_expenses)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Requester</Typography>
                <Typography sx={style.fieldValue}>
                  {currentRequest.requester?.firstname}{' '}
                  {currentRequest.requester?.lastname}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Verifier</Typography>
                <Typography sx={style.fieldValue}>
                  {currentRequest.verifier?.firstname}{' '}
                  {currentRequest.verifier?.lastname}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Signatures</Typography>
                <Typography sx={style.fieldValue}>
                  {currentRequest.signature_count || 0} signature(s)
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Verified</Typography>
                <Chip
                  label={currentRequest.is_verified ? 'Yes' : 'No'}
                  size="small"
                  sx={{
                    bgcolor: currentRequest.is_verified ? '#66BB6A' : '#FFA726',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Created At</Typography>
                <Typography sx={style.fieldValue}>
                  {formatDate(currentRequest.created_at)}
                </Typography>
              </Box>
            </Grid>

            {currentRequest.verification_notes && (
              <Grid item xs={12}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>
                    Verification Notes
                  </Typography>
                  <Typography sx={style.fieldValue}>
                    {currentRequest.verification_notes}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Expenses List */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#00529B"
            gutterBottom
          >
            Expenses ({currentRequest.expenses?.length || 0})
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {currentRequest.expenses && currentRequest.expenses.length > 0 ? (
            currentRequest.expenses.map((expense, index) => (
              <Box
                key={expense.id || index}
                sx={{
                  border: '1px solid rgba(0, 82, 155, 0.2)',
                  borderRadius: '8px',
                  p: 2,
                  mb: 2,
                  bgcolor: 'rgba(0, 82, 155, 0.02)',
                }}
              >
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={
                        expense.currency || currentRequest.currency || 'USD'
                      }
                      size="small"
                      sx={{
                        bgcolor: '#00529B',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                    <Typography variant="h6" fontWeight={700} color="#00529B">
                      {formatAmount(expense.amount)}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={style.fieldContainer}>
                      <Typography sx={style.fieldLabel}>Date</Typography>
                      <Typography sx={style.fieldValue}>
                        {expense.date
                          ? new Date(expense.date).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={style.fieldContainer}>
                      <Typography sx={style.fieldLabel}>Description</Typography>
                      <Typography sx={style.fieldValue}>
                        {expense.item_description || 'No description'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={style.fieldContainer}>
                      <Typography sx={style.fieldLabel}>
                        Supporting Document
                      </Typography>
                      {expense.supporting_document ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            bgcolor: 'rgba(0, 82, 155, 0.05)',
                            borderRadius: 1,
                            cursor: 'pointer',
                            mt: 0.5,
                            '&:hover': {
                              bgcolor: 'rgba(0, 82, 155, 0.1)',
                            },
                          }}
                          onClick={() =>
                            window.open(expense.supporting_document, '_blank')
                          }
                        >
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {expense.supporting_document.split('/').pop()}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: '#00529B', fontWeight: 500 }}
                          >
                            View
                          </Typography>
                        </Box>
                      ) : (
                        <Typography
                          sx={style.fieldValue}
                          color="text.secondary"
                        >
                          No document attached
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">No expenses recorded</Typography>
          )}

          {/* Total Summary */}
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
              Total Expenses ({currentRequest.currency || 'USD'}):
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#00529B">
              {formatAmount(currentRequest.total_expenses)}
            </Typography>
          </Box>
        </Paper>

        {/* Related Petty Cash */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#00529B"
            gutterBottom
          >
            Related Petty Cash Transaction
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Holder</Typography>
                <Typography sx={style.fieldValue}>
                  {currentRequest.related_petty_cash?.holder?.firstname}{' '}
                  {currentRequest.related_petty_cash?.holder?.lastname}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Issued By</Typography>
                <Typography sx={style.fieldValue}>
                  {currentRequest.related_petty_cash?.issued_by?.firstname}{' '}
                  {currentRequest.related_petty_cash?.issued_by?.lastname}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Issue Date</Typography>
                <Typography sx={style.fieldValue}>
                  {currentRequest.related_petty_cash?.issue_date
                    ? new Date(
                        currentRequest.related_petty_cash.issue_date
                      ).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Currency</Typography>
                <Chip
                  label={currentRequest.related_petty_cash?.currency || 'USD'}
                  size="small"
                  sx={{
                    bgcolor: '#00529B',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Status</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={
                      currentRequest.related_petty_cash?.status
                        ? currentRequest.related_petty_cash.status
                            .charAt(0)
                            .toUpperCase() +
                          currentRequest.related_petty_cash.status.slice(1)
                        : 'N/A'
                    }
                    size="small"
                    sx={{
                      bgcolor:
                        currentRequest.related_petty_cash?.status === 'active'
                          ? '#66BB6A'
                          : '#EF5350',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                  {currentRequest.related_petty_cash?.is_acknowledged && (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                      label="Acknowledged"
                      size="small"
                      sx={{
                        bgcolor: '#42A5F5',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Total Amount</Typography>
                <Typography
                  sx={style.fieldValue}
                  fontWeight={700}
                  color="#00529B"
                >
                  {formatAmount(currentRequest.related_petty_cash?.amount)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Remaining Amount</Typography>
                <Typography
                  sx={style.fieldValue}
                  fontWeight={700}
                  color="#00529B"
                >
                  {formatAmount(
                    currentRequest.related_petty_cash?.remaining_amount
                  )}
                </Typography>
              </Box>
            </Grid>

            {currentRequest.related_petty_cash?.notes && (
              <Grid item xs={12}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Notes</Typography>
                  <Typography sx={style.fieldValue}>
                    {currentRequest.related_petty_cash.notes}
                  </Typography>
                </Box>
              </Grid>
            )}

            {currentRequest.related_petty_cash?.acknowledgment_notes && (
              <Grid item xs={12}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>
                    Acknowledgment Notes
                  </Typography>
                  <Typography sx={style.fieldValue}>
                    {currentRequest.related_petty_cash.acknowledgment_notes}
                  </Typography>
                </Box>
              </Grid>
            )}

            {currentRequest.related_petty_cash?.acknowledged_at && (
              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Acknowledged At</Typography>
                  <Typography sx={style.fieldValue}>
                    {formatDate(
                      currentRequest.related_petty_cash.acknowledged_at
                    )}
                  </Typography>
                </Box>
              </Grid>
            )}

            {currentRequest.related_petty_cash?.supporting_document && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'rgba(0, 82, 155, 0.05)',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(0, 82, 155, 0.1)',
                    },
                  }}
                  onClick={() =>
                    window.open(
                      currentRequest.related_petty_cash.supporting_document,
                      '_blank'
                    )
                  }
                >
                  <Typography sx={{ flex: 1 }}>Supporting Document</Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#00529B', fontWeight: 500 }}
                  >
                    View Document
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Request History & Signatures */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#00529B"
            gutterBottom
          >
            Request History & Signatures
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loadingTracking ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : trackingData?.request_histories &&
            trackingData.request_histories.length > 0 ? (
            <Stepper orientation="vertical">
              {trackingData.request_histories.map((history, index) => (
                <Step key={history.id} active={true} completed={false}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor:
                            history.status?.toLowerCase() === 'approved'
                              ? '#66BB6A'
                              : history.status?.toLowerCase() === 'denied'
                              ? '#EF5350'
                              : '#42A5F5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        <PersonIcon />
                      </Box>
                    )}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {history.user?.firstname} {history.user?.lastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {history.user?.position} • Level {history.approval_level}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'rgba(0, 82, 155, 0.03)',
                        borderRadius: 1,
                        border: '1px solid rgba(0, 82, 155, 0.1)',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {getStatusChip(history.status)}
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Date
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(history.created_at)}
                          </Typography>
                        </Grid>

                        {history.notes && (
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Notes
                            </Typography>
                            <Typography variant="body2">
                              {history.notes}
                            </Typography>
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <Box
                            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                          >
                            {history.is_user_head_of_department && (
                              <Chip
                                label="Head of Department"
                                size="small"
                                sx={{
                                  bgcolor: '#42A5F5',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                            {history.is_in_same_department && (
                              <Chip
                                label="Same Department"
                                size="small"
                                sx={{
                                  bgcolor: '#66BB6A',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                            {history.signature && (
                              <Chip
                                icon={
                                  <VerifiedUserIcon sx={{ fontSize: 14 }} />
                                }
                                label="Digitally Signed"
                                size="small"
                                sx={{
                                  bgcolor: '#9C27B0',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          ) : (
            <Alert severity="info">
              No signature history found. The tracking data will appear here
              once signers start reviewing this request.
            </Alert>
          )}
        </Paper>

        {/* Sign Request Section */}
        {canUserSign() && (
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Sign This Request
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!showSignForm ? (
              <Button
                variant="contained"
                startIcon={<VerifiedUserIcon />}
                onClick={() => setShowSignForm(true)}
                size="large"
                sx={{
                  bgcolor: '#00529B',
                  '&:hover': {
                    bgcolor: '#003d73',
                  },
                  textTransform: 'none',
                  py: 1.5,
                  px: 4,
                }}
              >
                Sign This Request
              </Button>
            ) : (
              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Action *</InputLabel>
                  <Select
                    value={signAction}
                    onChange={(e) => setSignAction(e.target.value)}
                    label="Action *"
                    required
                  >
                    <MenuItem value="approve">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <ThumbUpIcon sx={{ color: '#66BB6A', fontSize: 20 }} />
                        <Typography>Approve</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="approve_and_forward">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <SendIcon sx={{ color: '#42A5F5', fontSize: 20 }} />
                        <Typography>Approve & Forward</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="deny">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <ThumbDownIcon
                          sx={{ color: '#EF5350', fontSize: 20 }}
                        />
                        <Typography>Deny</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="rollback">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <UndoIcon sx={{ color: '#9E9E9E', fontSize: 20 }} />
                        <Typography>Rollback</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {signAction === 'approve_and_forward' && (
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Next Signers *</InputLabel>
                      <Select
                        multiple
                        value={selectedSigners}
                        onChange={(e) => setSelectedSigners(e.target.value)}
                        label="Select Next Signers *"
                        required
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                          >
                            {selected.map((signerId) => {
                              const signer = availableSigners.find(
                                (s) => s.id === signerId
                              );
                              return (
                                <Chip
                                  key={signerId}
                                  label={`${signer?.firstname} ${signer?.lastname}`}
                                  onDelete={(e) => {
                                    e.stopPropagation();
                                    setSelectedSigners(
                                      selectedSigners.filter(
                                        (id) => id !== signerId
                                      )
                                    );
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                  }}
                                  size="small"
                                  sx={{
                                    bgcolor: '#00529B',
                                    color: 'white',
                                    '& .MuiChip-deleteIcon': {
                                      color: 'white',
                                      '&:hover': {
                                        color: '#ffcccc',
                                      },
                                    },
                                  }}
                                />
                              );
                            })}
                          </Box>
                        )}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                          autoFocus: false,
                        }}
                      >
                        {availableSigners.map((signer) => (
                          <MenuItem key={signer.id} value={signer.id}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  {signer.firstname} {signer.lastname}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {signer.position} • {signer.department}
                                </Typography>
                              </Box>
                              {selectedSigners.includes(signer.id) && (
                                <CheckCircleIcon
                                  sx={{ color: '#00529B', fontSize: 20 }}
                                />
                              )}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={
                    signAction === 'deny' || signAction === 'rollback'
                      ? 'Notes (Required) *'
                      : 'Notes (Optional)'
                  }
                  value={signNotes}
                  onChange={(e) => setSignNotes(e.target.value)}
                  placeholder="Add any comments or notes..."
                  required={signAction === 'deny' || signAction === 'rollback'}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowSignForm(false);
                      setSignAction('');
                      setSignNotes('');
                      setSelectedSigners([]);
                    }}
                    sx={{
                      borderColor: '#666',
                      color: '#666',
                      textTransform: 'none',
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSignRequest}
                    disabled={isLoading}
                    sx={{
                      bgcolor: '#00529B',
                      '&:hover': {
                        bgcolor: '#003d73',
                      },
                      textTransform: 'none',
                    }}
                  >
                    {isLoading ? 'Signing...' : 'Submit Signature'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Status Alert */}
        {currentRequest.status !== 'pending' &&
          currentRequest.status !== 'waiting to sign' && (
            <Alert
              severity={
                currentRequest.status === 'approved'
                  ? 'success'
                  : currentRequest.status === 'denied'
                  ? 'error'
                  : 'info'
              }
            >
              This request has been <strong>{currentRequest.status}</strong>.
              {currentRequest.verification_notes && (
                <Box sx={{ mt: 1 }}>
                  <strong>Verification Notes:</strong>{' '}
                  {currentRequest.verification_notes}
                </Box>
              )}
            </Alert>
          )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'rgba(0, 82, 155, 0.02)' }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: '#00529B',
            color: '#00529B',
            '&:hover': {
              borderColor: '#003d73',
              bgcolor: 'rgba(0, 82, 155, 0.05)',
            },
            textTransform: 'none',
            px: 4,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrackAndSignPettyCashDialog;
