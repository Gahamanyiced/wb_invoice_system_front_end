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
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import TimelineIcon from '@mui/icons-material/Timeline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import UndoIcon from '@mui/icons-material/Undo';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const TrackAndSignPettyCashDialog = ({ open, handleClose, request }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.pettyCash);

  // Get logged-in user from localStorage
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [trackingData, setTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [signAction, setSignAction] = useState(''); // 'approve', 'approve_and_forward', 'deny', 'rollback'
  const [signNotes, setSignNotes] = useState('');
  const [showSignForm, setShowSignForm] = useState(false);
  const [selectedSigners, setSelectedSigners] = useState([]); // For approve_and_forward
  const [availableSigners, setAvailableSigners] = useState([]); // List of signers from API

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
      // API Endpoint: GET /auth/signer-list/
      const result = await dispatch(getAllSigners()).unwrap();
      // Extract the results array from the paginated response
      setAvailableSigners(result?.results || []);
    } catch (error) {
      console.error('Failed to fetch signers:', error);
      // Set empty array on error so UI doesn't break
      setAvailableSigners([]);
    }
  };

  const fetchTrackingData = async () => {
    setLoadingTracking(true);
    try {
      // Use the track endpoint: GET /invoice/petty-cash-request/{id}/track/
      const result = await dispatch(trackPettyCashRequest(request.id)).unwrap();

      // The response contains: { request: {...}, request_histories: [...] }
      setTrackingData(result);
    } catch (error) {
      toast.error(error || 'Failed to fetch tracking data');
      // Set empty tracking data on error so we can still show the UI
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

    // Validate next signers for approve_and_forward
    if (signAction === 'approve_and_forward' && selectedSigners.length === 0) {
      toast.error('Please select at least one next signer');
      return;
    }

    try {
      // API Endpoint: POST /invoice/petty-cash-request/sign/{id}/
      let signData = {};

      // Build request payload based on action
      if (signAction === 'approve') {
        // Simple approve with final_approval flag
        signData = {
          status: 'signed',
          notes: signNotes || '',
          final_approval: true,
        };
      } else if (signAction === 'approve_and_forward') {
        // Approve and forward to next signers
        signData = {
          status: 'signed',
          notes: signNotes || '',
          next_signers: selectedSigners, // Array of signer IDs
        };
      } else if (signAction === 'deny') {
        // Deny the request
        signData = {
          status: 'denied',
          notes: signNotes || '',
        };
      } else if (signAction === 'rollback') {
        // Rollback signature
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

      // Refresh tracking data and request list
      await fetchTrackingData();
      dispatch(getAllPettyCashRequests({ page: 1 }));

      // Reset form
      setShowSignForm(false);
      setSignAction('');
      setSignNotes('');
      setSelectedSigners([]);
    } catch (error) {
      toast.error(error || 'Failed to sign request');
    }
  };

  const getStatusChip = (status) => {
    // Normalize status: convert underscores to spaces for matching
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

    // Display status with proper formatting (replace underscores with spaces)
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

  const getStepIcon = (status) => {
    const iconProps = { sx: { fontSize: 32 } };

    // Normalize status: convert underscores to spaces
    const statusLower = status?.toLowerCase().replace(/_/g, ' ');

    if (statusLower === 'approved' || statusLower === 'verified') {
      return (
        <CheckCircleIcon
          {...iconProps}
          sx={{ ...iconProps.sx, color: '#66BB6A' }}
        />
      );
    } else if (statusLower === 'denied') {
      return (
        <CancelIcon {...iconProps} sx={{ ...iconProps.sx, color: '#EF5350' }} />
      );
    } else if (statusLower === 'rolled_back' || statusLower === 'rolled back') {
      return (
        <UndoIcon {...iconProps} sx={{ ...iconProps.sx, color: '#9E9E9E' }} />
      );
    } else if (statusLower === 'waiting to sign' || statusLower === 'to sign') {
      return (
        <HourglassEmptyIcon
          {...iconProps}
          sx={{ ...iconProps.sx, color: '#FF9800' }}
        />
      );
    } else if (statusLower === 'to verify') {
      return (
        <VerifiedUserIcon
          {...iconProps}
          sx={{ ...iconProps.sx, color: '#42A5F5' }}
        />
      );
    }
    return (
      <PendingIcon {...iconProps} sx={{ ...iconProps.sx, color: '#FFA726' }} />
    );
  };

  const canUserSign = () => {
    if (!trackingData || !loggedInUser) return false;

    // Check if any history has "to verify" or "to sign" status for this user
    // Handle both formats: "to_verify"/"to verify" and "to_sign"/"to sign"
    const canSign = trackingData.request_histories?.some((history) => {
      const statusLower = history.status?.toLowerCase().replace(/_/g, ' ');
      return (
        history.user?.id === loggedInUser.id &&
        (statusLower === 'to verify' || // ✅ Can verify
          statusLower === 'to sign')
      ); // ✅ Can sign
    });

    return canSign;
  };

  const canRollback = () => {
    if (!trackingData || !loggedInUser) return false;

    // User can rollback if they have signed (approved/verified status)
    // Handle both formats: "approved"/"verified"
    const userHasSigned = trackingData.request_histories?.some((history) => {
      const statusLower = history.status?.toLowerCase().replace(/_/g, ' ');
      return (
        history.user?.id === loggedInUser.id &&
        (statusLower === 'approved' || statusLower === 'verified')
      );
    });

    return userHasSigned;
  };

  const getStepBackgroundColor = (status) => {
    // Normalize status: convert underscores to spaces
    const statusLower = status?.toLowerCase().replace(/_/g, ' ');

    if (statusLower === 'approved' || statusLower === 'verified') {
      return 'rgba(102, 187, 106, 0.08)';
    } else if (statusLower === 'denied') {
      return 'rgba(239, 83, 80, 0.08)';
    } else if (statusLower === 'rolled back') {
      return 'rgba(158, 158, 158, 0.08)';
    } else if (statusLower === 'waiting to sign' || statusLower === 'to sign') {
      return 'rgba(255, 152, 0, 0.08)';
    } else if (statusLower === 'to verify') {
      return 'rgba(66, 165, 245, 0.08)';
    }
    return 'rgba(255, 167, 38, 0.08)';
  };

  const getStepBorderColor = (status) => {
    // Normalize status: convert underscores to spaces
    const statusLower = status?.toLowerCase().replace(/_/g, ' ');

    if (statusLower === 'approved' || statusLower === 'verified') {
      return '#66BB6A';
    } else if (statusLower === 'denied') {
      return '#EF5350';
    } else if (statusLower === 'rolled back') {
      return '#9E9E9E';
    } else if (statusLower === 'waiting to sign' || statusLower === 'to sign') {
      return '#FF9800';
    } else if (statusLower === 'to verify') {
      return '#42A5F5';
    }
    return '#FFA726';
  };

  if (!request) return null;

  // Use trackingData.request if available, otherwise use the passed request
  const currentRequest = trackingData?.request || request;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#00529B',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon />
          <Typography variant="h6" fontWeight={600}>
            Track & Sign Petty Cash Request
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Request Summary Card */}
        <Card elevation={3} sx={{ mb: 3, bgcolor: 'rgba(0, 82, 155, 0.02)' }}>
          <CardContent>
            <Grid container spacing={3}>
              {/* Request ID & Status */}
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Request ID
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="#00529B">
                    #{currentRequest.id}
                  </Typography>
                </Box>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" mb={1}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {getStatusChip(currentRequest.status)}
                  </Box>
                  <Chip
                    icon={
                      currentRequest.is_verified ? (
                        <CheckCircleIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <PendingIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    label={
                      currentRequest.is_verified ? 'Verified' : 'Not Verified'
                    }
                    size="small"
                    sx={{
                      bgcolor: currentRequest.is_verified
                        ? '#66BB6A'
                        : '#FFA726',
                      color: 'white',
                      fontWeight: 500,
                      mt: 1,
                    }}
                  />
                </Box>
              </Grid>

              {/* Total Amount */}
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#00529B">
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                      minimumFractionDigits: 0,
                    }).format(parseFloat(currentRequest.total_expenses || 0))}
                  </Typography>
                </Box>
              </Grid>

              {/* Signatures */}
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Approval Progress
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#00529B">
                    {currentRequest.signature_count} / Level{' '}
                    {currentRequest.current_approval_level}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Signatures
                  </Typography>
                </Box>
              </Grid>

              {/* Requester Info */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 1,
                  }}
                >
                  <PersonIcon sx={{ color: '#00529B', mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Requester
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {currentRequest.requester?.firstname}{' '}
                      {currentRequest.requester?.lastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentRequest.requester?.position} •{' '}
                      {currentRequest.requester?.department}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Verifier Info */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 1,
                  }}
                >
                  <VerifiedUserIcon sx={{ color: '#00529B', mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Verifier
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {currentRequest.verifier?.firstname}{' '}
                      {currentRequest.verifier?.lastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentRequest.verifier?.position} •{' '}
                      {currentRequest.verifier?.department}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Related Petty Cash */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 1,
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ color: '#00529B', mr: 1 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Related Petty Cash
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      PC-{currentRequest.related_petty_cash?.id} -{' '}
                      {currentRequest.related_petty_cash?.holder?.firstname}{' '}
                      {currentRequest.related_petty_cash?.holder?.lastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Amount:{' '}
                      {new Intl.NumberFormat('en-RW', {
                        style: 'currency',
                        currency: 'RWF',
                        minimumFractionDigits: 0,
                      }).format(
                        parseFloat(
                          currentRequest.related_petty_cash?.amount || 0
                        )
                      )}{' '}
                      • Remaining:{' '}
                      {new Intl.NumberFormat('en-RW', {
                        style: 'currency',
                        currency: 'RWF',
                        minimumFractionDigits: 0,
                      }).format(
                        parseFloat(
                          currentRequest.related_petty_cash?.remaining_amount ||
                            0
                        )
                      )}
                    </Typography>
                  </Box>
                  <Chip
                    label={currentRequest.related_petty_cash?.status?.toUpperCase()}
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
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {/* Request History & Signatures */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            color="#00529B"
            sx={{ mb: 2 }}
          >
            <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Request History & Signatures
          </Typography>

          {loadingTracking ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : trackingData?.request_histories &&
            trackingData.request_histories.length > 0 ? (
            <Stepper
              orientation="vertical"
              activeStep={trackingData.request_histories.length}
            >
              {trackingData.request_histories.map((history, index) => (
                <Step key={history.id || index} completed active>
                  <StepLabel
                    icon={getStepIcon(history.status)}
                    StepIconProps={{
                      sx: {
                        width: 50,
                        height: 50,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {history.user?.firstname} {history.user?.lastname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {history.user?.position} • {history.user?.department}
                          {history.user?.section &&
                            ` • ${history.user.section}`}
                        </Typography>
                      </Box>
                      {history.created_at && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 14, color: 'text.secondary' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(history.created_at).toLocaleDateString(
                              'en-GB'
                            )}{' '}
                            {new Date(history.created_at).toLocaleTimeString(
                              'en-GB',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2.5,
                        ml: 2,
                        bgcolor: getStepBackgroundColor(history.status),
                        borderLeft: '4px solid',
                        borderColor: getStepBorderColor(history.status),
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 1 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Status
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {getStatusChip(history.status)}
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Approval Level:</strong>{' '}
                            {history.approval_level}
                          </Typography>
                        </Grid>
                        {history.notes && (
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                p: 1.5,
                                bgcolor: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: 1,
                                borderLeft: '3px solid #00529B',
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                fontWeight={600}
                              >
                                Notes:
                              </Typography>
                              <Typography variant="body2">
                                {history.notes}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <Box
                            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                          >
                            {history.is_user_head_of_department && (
                              <Chip
                                icon={<BusinessIcon sx={{ fontSize: 14 }} />}
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
            <Alert severity="info" sx={{ mt: 2 }}>
              No signature history found. The tracking data will appear here
              once signers start reviewing this request.
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Sign Request Section */}
        {canUserSign() && (
          <Box>
            <Typography
              variant="h6"
              fontWeight={600}
              color="#00529B"
              sx={{ mb: 2 }}
            >
              <VerifiedUserIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Sign This Request
            </Typography>

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
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  border: '2px solid rgba(0, 82, 155, 0.2)',
                  borderRadius: 2,
                }}
              >
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Action *</InputLabel>
                  <Select
                    value={signAction}
                    onChange={(e) => {
                      setSignAction(e.target.value);
                      // Fetch signers list when approve & forward is selected
                      if (e.target.value === 'approve_and_forward') {
                        // Signers already fetched on dialog open
                      }
                    }}
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
                        <Typography>Deny Request</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="rollback">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <UndoIcon sx={{ color: '#9E9E9E', fontSize: 20 }} />
                        <Typography>Rollback Request</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Show warning alert for rollback action */}
                {signAction === 'rollback' && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You are about to rollback your signature. This will return
                    the request to its previous state.
                  </Alert>
                )}

                {/* Additional Signers Field - Only show for "approve_and_forward" */}
                {signAction === 'approve_and_forward' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
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
                                label={
                                  signer
                                    ? `${signer.firstname} ${signer.lastname}`
                                    : signerId
                                }
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(0, 82, 155, 0.1)',
                                  color: '#00529B',
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {availableSigners.length > 0 ? (
                        availableSigners.map((signer) => (
                          <MenuItem key={signer.id} value={signer.id}>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
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
                        <MenuItem disabled>
                          <Typography variant="body2" color="text.secondary">
                            Loading signers...
                          </Typography>
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}

                <TextField
                  fullWidth
                  label={
                    signAction === 'rollback'
                      ? 'Reason for Rollback (Optional)'
                      : 'Notes (Optional)'
                  }
                  multiline
                  rows={3}
                  value={signNotes}
                  onChange={(e) => setSignNotes(e.target.value)}
                  placeholder={
                    signAction === 'rollback'
                      ? 'Explain why you are rolling back your signature...'
                      : 'Add any comments or reasons for your decision...'
                  }
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSignRequest}
                    disabled={
                      isLoading ||
                      !signAction ||
                      (signAction === 'approve_and_forward' &&
                        selectedSigners.length === 0)
                    }
                    sx={{
                      bgcolor:
                        signAction === 'approve' ||
                        signAction === 'approve_and_forward'
                          ? '#66BB6A'
                          : signAction === 'deny'
                          ? '#EF5350'
                          : '#9E9E9E',
                      '&:hover': {
                        bgcolor:
                          signAction === 'approve' ||
                          signAction === 'approve_and_forward'
                            ? '#4CAF50'
                            : signAction === 'deny'
                            ? '#D32F2F'
                            : '#757575',
                      },
                      textTransform: 'none',
                      px: 4,
                    }}
                  >
                    {isLoading
                      ? 'Submitting...'
                      : signAction === 'rollback'
                      ? 'Confirm Rollback'
                      : 'Submit Signature'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowSignForm(false);
                      setSignAction('');
                      setSignNotes('');
                      setSelectedSigners([]);
                    }}
                    sx={{
                      borderColor: '#999',
                      color: '#666',
                      textTransform: 'none',
                      px: 3,
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* Rollback Section - Separate from Sign Form */}
        {canRollback() && !canUserSign() && (
          <Box>
            <Typography
              variant="h6"
              fontWeight={600}
              color="#00529B"
              sx={{ mb: 2 }}
            >
              <UndoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Rollback Your Signature
            </Typography>

            {!showSignForm ? (
              <Button
                variant="outlined"
                startIcon={<UndoIcon />}
                onClick={() => {
                  setShowSignForm(true);
                  setSignAction('rollback');
                }}
                size="large"
                sx={{
                  borderColor: '#9E9E9E',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#757575',
                    bgcolor: 'rgba(158, 158, 158, 0.1)',
                  },
                  textTransform: 'none',
                  py: 1.5,
                  px: 4,
                }}
              >
                Rollback Signature
              </Button>
            ) : (
              signAction === 'rollback' && (
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    border: '2px solid rgba(158, 158, 158, 0.2)',
                    borderRadius: 2,
                  }}
                >
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You are about to rollback your signature. This will return
                    the request to its previous state.
                  </Alert>

                  <TextField
                    fullWidth
                    label="Reason for Rollback (Optional)"
                    multiline
                    rows={3}
                    value={signNotes}
                    onChange={(e) => setSignNotes(e.target.value)}
                    placeholder="Explain why you are rolling back your signature..."
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<UndoIcon />}
                      onClick={handleSignRequest}
                      disabled={isLoading}
                      sx={{
                        bgcolor: '#9E9E9E',
                        '&:hover': {
                          bgcolor: '#757575',
                        },
                        textTransform: 'none',
                        px: 4,
                      }}
                    >
                      {isLoading ? 'Processing...' : 'Confirm Rollback'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowSignForm(false);
                        setSignAction('');
                        setSignNotes('');
                      }}
                      sx={{
                        borderColor: '#999',
                        color: '#666',
                        textTransform: 'none',
                        px: 3,
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              )
            )}
          </Box>
        )}

        {!canUserSign() && !canRollback() && (
          <Alert severity="info" icon={<VerifiedUserIcon />}>
            You do not have permission to sign this request at this time.
          </Alert>
        )}

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
