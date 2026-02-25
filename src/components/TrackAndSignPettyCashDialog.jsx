import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  trackPettyCashExpense,
  approvePettyCashExpense,
} from '../features/pettyCash/pettyCashSlice';
import { getAllSigners } from '../features/user/userSlice';
import { toast } from 'react-toastify';
import {
  Dialog,
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
import CancelIcon from '@mui/icons-material/Cancel';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import UndoIcon from '@mui/icons-material/Undo';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PendingIcon from '@mui/icons-material/Pending';

// ── Styles ────────────────────────────────────────────────────────────────────

const style = {
  header: {
    bgcolor: '#00529B',
    color: 'white',
    p: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    mb: 3,
    p: 2.5,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
    border: '1px solid rgba(0, 82, 155, 0.08)',
    borderRadius: 2,
  },
  fieldLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    mb: 0.5,
  },
  fieldValue: {
    fontSize: '0.975rem',
    color: '#222',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

const TrackAndSignPettyCashDialog = ({
  open,
  handleClose,
  request,
  onApprove,
}) => {
  const dispatch = useDispatch();
  const { isLoading, expenseTrackingData } = useSelector(
    (state) => state.pettyCash,
  );

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [signAction, setSignAction] = useState('');
  const [signNotes, setSignNotes] = useState('');
  const [showSignForm, setShowSignForm] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [availableSigners, setAvailableSigners] = useState([]);
  const [nextApproverId, setNextApproverId] = useState('');
  const [nextApproverError, setNextApproverError] = useState('');
  const [isFinalApproval, setIsFinalApproval] = useState(false);

  // expense line from flat API:
  // { id, date, item_description, amount, currency, supporting_document, created_at }

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) setLoggedInUser(user);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (open && request?.id) {
      fetchTrackingData();
      fetchSigners();
    }
  }, [open, request?.id]);

  const fetchSigners = async () => {
    try {
      const result = await dispatch(
        getAllSigners({ is_petty_cash_user: 'true' }),
      ).unwrap();
      setAvailableSigners(result?.results || []);
    } catch {
      setAvailableSigners([]);
    }
  };

  const fetchTrackingData = async () => {
    setLoadingTracking(true);
    try {
      await dispatch(trackPettyCashExpense(request.id)).unwrap();
    } catch (error) {
      toast.error(error || 'Failed to load tracking data');
    } finally {
      setLoadingTracking(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────

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

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));

  const getStatusChip = (status) => {
    const map = {
      pending: {
        bgcolor: '#FFA726',
        icon: <PendingIcon sx={{ fontSize: 15 }} />,
      },
      approved: {
        bgcolor: '#66BB6A',
        icon: <CheckCircleIcon sx={{ fontSize: 15 }} />,
      },
      denied: {
        bgcolor: '#EF5350',
        icon: <CancelIcon sx={{ fontSize: 15 }} />,
      },
      verified: {
        bgcolor: '#42A5F5',
        icon: <CheckCircleIcon sx={{ fontSize: 15 }} />,
      },
      rolled_back: {
        bgcolor: '#9E9E9E',
        icon: <UndoIcon sx={{ fontSize: 15 }} />,
      },
      'to verify': {
        bgcolor: '#42A5F5',
        icon: <VerifiedUserIcon sx={{ fontSize: 15 }} />,
      },
      'to sign': {
        bgcolor: '#FF9800',
        icon: <HourglassEmptyIcon sx={{ fontSize: 15 }} />,
      },
    };
    const key = status?.toLowerCase().replace(/_/g, ' ');
    const cfg = map[key] || map['pending'];
    const label = (status || 'N/A').replace(/_/g, ' ');
    return (
      <Chip
        icon={cfg.icon}
        label={label.charAt(0).toUpperCase() + label.slice(1)}
        size="small"
        sx={{ bgcolor: cfg.bgcolor, color: 'white', fontWeight: 600 }}
      />
    );
  };

  const canUserSign = () => {
    if (!expenseTrackingData || !loggedInUser) return false;
    return expenseTrackingData.expense_histories?.some((h) => {
      const s = h.status?.toLowerCase().replace(/_/g, ' ');
      return (
        h.user?.id === loggedInUser.id && (s === 'to verify' || s === 'to sign')
      );
    });
  };

  // ── Sign submit → approvePettyCashExpense ─────────────────────────────────────

  const handleSignSubmit = async () => {
    if (!signAction) {
      toast.error('Please select an action');
      return;
    }

    // Notes required for deny and rollback
    if (
      (signAction === 'deny' || signAction === 'rollback') &&
      !signNotes.trim()
    ) {
      setNotesError('Notes are required for this action');
      return;
    }

    // Next approver required for approve_and_forward
    if (signAction === 'approve_and_forward' && !nextApproverId) {
      setNextApproverError('Please select the next approver');
      return;
    }

    setNotesError('');
    setNextApproverError('');

    // Build payload based on action type
    let payload;
    if (signAction === 'approve_and_forward') {
      payload = {
        action: 'approve',
        notes: signNotes.trim(),
        next_approver_id: nextApproverId,
      };
    } else if (signAction === 'approve_final') {
      payload = {
        action: 'approve',
        notes: signNotes.trim(),
        final_approval: true,
      };
    } else {
      // approve (simple), deny, rollback
      payload = {
        action: signAction,
        notes: signNotes.trim(),
      };
    }

    const result = await dispatch(
      approvePettyCashExpense({ id: request.id, data: payload }),
    );

    if (approvePettyCashExpense.fulfilled.match(result)) {
      const labels = {
        approve: 'approved',
        approve_and_forward: 'approved and forwarded',
        approve_final: 'finally approved',
        deny: 'denied',
        rollback: 'rolled back',
      };
      toast.success(
        `Expense ${labels[signAction] || signAction} successfully.`,
      );
      await fetchTrackingData();
      resetSignForm();
      // Notify parent to refresh list
      if (onApprove) onApprove(request.id, payload.action, signNotes.trim());
    } else {
      toast.error(result.payload || `Failed to ${signAction} expense.`);
    }
  };

  const resetSignForm = () => {
    setShowSignForm(false);
    setSignAction('');
    setSignNotes('');
    setNotesError('');
    setNextApproverId('');
    setNextApproverError('');
    setIsFinalApproval(false);
  };

  const handleClose_ = () => {
    resetSignForm();
    handleClose();
  };

  if (!request) return null;

  const trackingHistories = expenseTrackingData?.expense_histories || [];
  const currentStatus = expenseTrackingData?.expense?.status || request.status;

  return (
    <Dialog
      open={open}
      onClose={handleClose_}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
    >
      {/* Header */}
      <Box sx={style.header}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Track & Sign Expense
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            ID #{request.id} — {request.item_description || 'Expense'}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose_}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Expense Summary */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#00529B"
            gutterBottom
          >
            Expense Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography sx={style.fieldLabel}>Date</Typography>
              <Typography sx={style.fieldValue}>
                {request.date
                  ? new Date(request.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={style.fieldLabel}>Amount</Typography>
              <Typography
                sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#00529B' }}
              >
                {formatAmount(request.amount)}{' '}
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {request.currency}
                </Typography>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={style.fieldLabel}>Currency</Typography>
              <Chip
                label={request.currency || 'N/A'}
                size="small"
                sx={{
                  bgcolor: '#00529B',
                  color: 'white',
                  fontWeight: 600,
                  mt: 0.5,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={style.fieldLabel}>Created At</Typography>
              <Typography sx={style.fieldValue}>
                {formatDate(request.created_at)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography sx={style.fieldLabel}>Item Description</Typography>
              <Typography sx={style.fieldValue}>
                {request.item_description || 'N/A'}
              </Typography>
            </Grid>

            {request.supporting_document && (
              <Grid item xs={12}>
                <Typography sx={style.fieldLabel}>
                  Supporting Document
                </Typography>
                <Box
                  onClick={() =>
                    window.open(request.supporting_document, '_blank')
                  }
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mt: 0.75,
                    p: 1.5,
                    bgcolor: 'rgba(0, 82, 155, 0.05)',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '1px solid rgba(0, 82, 155, 0.15)',
                    '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.1)' },
                  }}
                >
                  <AttachFileIcon
                    sx={{ mr: 1, color: '#00529B', fontSize: 18 }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {request.supporting_document.split('/').pop()}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: '#00529B', fontWeight: 600 }}
                  >
                    View
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Tracking History */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#00529B"
            gutterBottom
          >
            Approval History
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loadingTracking ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} sx={{ color: '#00529B' }} />
            </Box>
          ) : trackingHistories.length > 0 ? (
            <Stepper orientation="vertical">
              {trackingHistories.map((history) => (
                <Step key={history.id} active completed={false}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
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
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Box>
                    )}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {history.user?.firstname} {history.user?.lastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {history.user?.position}
                      {history.approval_level
                        ? ` • Level ${history.approval_level}`
                        : ''}
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
                      <Grid container spacing={1.5}>
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
                        {history.comment && (
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Comment
                            </Typography>
                            <Typography variant="body2">
                              {history.comment}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          ) : (
            <Alert severity="info">
              No approval history yet. History will appear here once reviewers
              act on this expense.
            </Alert>
          )}
        </Paper>

        {/* Sign Section — shown if current user has a pending action */}
        {canUserSign() && (
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Take Action
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!showSignForm ? (
              <Button
                variant="contained"
                startIcon={<VerifiedUserIcon />}
                onClick={() => setShowSignForm(true)}
                sx={{
                  bgcolor: '#00529B',
                  '&:hover': { bgcolor: '#003d73' },
                  textTransform: 'none',
                  py: 1.25,
                  px: 4,
                }}
              >
                Review This Expense
              </Button>
            ) : (
              <Box>
                {/* Action selector */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Action *</InputLabel>
                  <Select
                    value={signAction}
                    onChange={(e) => {
                      setSignAction(e.target.value);
                      setNotesError('');
                      setNextApproverError('');
                      setNextApproverId('');
                      setIsFinalApproval(e.target.value === 'approve_final');
                    }}
                    label="Action *"
                  >
                    <MenuItem value="approve">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <ThumbUpIcon sx={{ color: '#66BB6A', fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            Approve
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Simple approval
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="approve_and_forward">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <ThumbUpIcon sx={{ color: '#42A5F5', fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            Approve & Forward
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Approve and assign next approver
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="approve_final">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <CheckCircleIcon
                          sx={{ color: '#2E7D32', fontSize: 20 }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            Final Approval
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Mark as finally approved
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="deny">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <ThumbDownIcon
                          sx={{ color: '#EF5350', fontSize: 20 }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            Deny
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Reject this expense
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="rollback">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <UndoIcon sx={{ color: '#FF9800', fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            Rollback
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Return to previous signer
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Next approver — only for approve_and_forward */}
                {signAction === 'approve_and_forward' && (
                  <FormControl
                    fullWidth
                    sx={{ mb: 2 }}
                    error={!!nextApproverError}
                  >
                    <InputLabel>Next Approver *</InputLabel>
                    <Select
                      value={nextApproverId}
                      onChange={(e) => {
                        setNextApproverId(e.target.value);
                        setNextApproverError('');
                      }}
                      label="Next Approver *"
                      MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select next approver</em>
                      </MenuItem>
                      {availableSigners.map((signer) => (
                        <MenuItem
                          key={signer.id}
                          value={signer.id}
                          sx={{ py: 1.25 }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {signer.firstname} {signer.lastname}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {signer.position} • {signer.department}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {nextApproverError && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {nextApproverError}
                      </Typography>
                    )}
                  </FormControl>
                )}

                {/* Notes */}
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
                  onChange={(e) => {
                    setSignNotes(e.target.value);
                    setNotesError('');
                  }}
                  placeholder={
                    signAction === 'approve_and_forward'
                      ? 'e.g. Approved, forwarding to department head'
                      : signAction === 'approve_final'
                        ? 'e.g. Final approval'
                        : signAction === 'rollback'
                          ? 'e.g. Rolled back to the previous signer'
                          : 'Add any comments...'
                  }
                  required={signAction === 'deny' || signAction === 'rollback'}
                  error={!!notesError}
                  helperText={notesError}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={resetSignForm}
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
                    onClick={handleSignSubmit}
                    disabled={isLoading || !signAction}
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={18} sx={{ color: 'white' }} />
                      ) : null
                    }
                    sx={{
                      bgcolor:
                        signAction === 'deny'
                          ? '#EF5350'
                          : signAction === 'rollback'
                            ? '#FF9800'
                            : signAction === 'approve_final'
                              ? '#2E7D32'
                              : '#00529B',
                      '&:hover': {
                        bgcolor:
                          signAction === 'deny'
                            ? '#d32f2f'
                            : signAction === 'rollback'
                              ? '#e65100'
                              : signAction === 'approve_final'
                                ? '#1B5E20'
                                : '#003d73',
                      },
                      textTransform: 'none',
                      minWidth: 180,
                    }}
                  >
                    {isLoading
                      ? 'Submitting...'
                      : signAction === 'deny'
                        ? 'Deny Expense'
                        : signAction === 'rollback'
                          ? 'Rollback Expense'
                          : signAction === 'approve_and_forward'
                            ? 'Approve & Forward'
                            : signAction === 'approve_final'
                              ? 'Final Approval'
                              : 'Approve Expense'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Status banner for finalized expenses */}
        {currentStatus &&
          !['pending', 'to sign', 'to verify'].includes(
            currentStatus?.toLowerCase(),
          ) && (
            <Alert
              severity={
                currentStatus?.toLowerCase() === 'approved'
                  ? 'success'
                  : currentStatus?.toLowerCase() === 'denied'
                    ? 'error'
                    : 'info'
              }
              sx={{ mt: 1 }}
            >
              This expense has been{' '}
              <strong>{currentStatus.replace(/_/g, ' ')}</strong>.
            </Alert>
          )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'rgba(0, 82, 155, 0.02)' }}>
        <Button
          onClick={handleClose_}
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
