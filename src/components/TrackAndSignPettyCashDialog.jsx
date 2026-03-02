import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  trackPettyCashExpense,
  approvePettyCashExpense,
  trackPettyCashReplenishRequest,
  approvePettyCashRequest,
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

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
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    mb: 0.4,
    display: 'block',
  },
  fieldValue: {
    fontSize: '0.95rem',
    color: '#222',
  },
};

// ── StatusChip ────────────────────────────────────────────────────────────────

const StatusChip = ({ status }) => {
  const map = {
    pending: {
      bgcolor: '#FFA726',
      icon: <PendingIcon sx={{ fontSize: 14 }} />,
    },
    approved: {
      bgcolor: '#66BB6A',
      icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    },
    denied: { bgcolor: '#EF5350', icon: <CancelIcon sx={{ fontSize: 14 }} /> },
    verified: {
      bgcolor: '#42A5F5',
      icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    },
    signed: {
      bgcolor: '#9C27B0',
      icon: <VerifiedUserIcon sx={{ fontSize: 14 }} />,
    },
    rolled_back: {
      bgcolor: '#9E9E9E',
      icon: <UndoIcon sx={{ fontSize: 14 }} />,
    },
    to_sign: {
      bgcolor: '#FF9800',
      icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} />,
    },
    to_verify: {
      bgcolor: '#42A5F5',
      icon: <VerifiedUserIcon sx={{ fontSize: 14 }} />,
    },
  };
  const key = status?.toLowerCase().replace(/ /g, '_');
  const cfg = map[key] || {
    bgcolor: '#9E9E9E',
    icon: <PendingIcon sx={{ fontSize: 14 }} />,
  };
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (d) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d;
  }
};

const formatAmount = (a) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(a || 0));

const userName = (user) =>
  user?.name ||
  `${user?.firstname || ''} ${user?.lastname || ''}`.trim() ||
  'N/A';

// ── Component ─────────────────────────────────────────────────────────────────

const TrackAndSignPettyCashDialog = ({
  open,
  handleClose,
  request,
  onApprove,
  // ── Context props ─────────────────────────────────────────────────────────
  // Pass these when used from RequestPettyCash (replenishment requests):
  //   trackThunk={trackPettyCashReplenishRequest}
  //   approveThunk={approvePettyCashRequest}
  //   trackingStateKey="replenishRequestTrackingData"
  // Defaults to expense context (ManageExpenses).
  trackThunk = trackPettyCashExpense,
  approveThunk = approvePettyCashExpense,
  trackingStateKey = 'expenseTrackingData',
}) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.pettyCash);
  const trackingData = useSelector(
    (state) => state.pettyCash[trackingStateKey],
  );

  const [loadingTracking, setLoadingTracking] = useState(false);
  const [signAction, setSignAction] = useState('');
  const [signNotes, setSignNotes] = useState('');
  const [showSignForm, setShowSignForm] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [availableSigners, setAvailableSigners] = useState([]);
  const [nextApproverId, setNextApproverId] = useState('');
  const [nextApproverError, setNextApproverError] = useState('');

  useEffect(() => {
    if (open && request?.id) {
      fetchTrackingData();
      fetchSigners();
    }
  }, [open, request?.id]);

  const fetchTrackingData = async () => {
    setLoadingTracking(true);
    try {
      await dispatch(trackThunk(request.id)).unwrap();
    } catch (error) {
      toast.error(error || 'Failed to load tracking data');
    } finally {
      setLoadingTracking(false);
    }
  };

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

  const resetSignForm = () => {
    setShowSignForm(false);
    setSignAction('');
    setSignNotes('');
    setNotesError('');
    setNextApproverId('');
    setNextApproverError('');
  };

  const handleClose_ = () => {
    resetSignForm();
    handleClose();
  };

  // ── Sign submit ───────────────────────────────────────────────────────────

  const handleSignSubmit = async () => {
    if (!signAction) {
      toast.error('Please select an action');
      return;
    }
    if (
      (signAction === 'deny' || signAction === 'rollback') &&
      !signNotes.trim()
    ) {
      setNotesError('Notes are required for this action');
      return;
    }
    if (signAction === 'approve_and_forward' && !nextApproverId) {
      setNextApproverError('Please select the next approver');
      return;
    }
    setNotesError('');
    setNextApproverError('');

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
      payload = { action: signAction, notes: signNotes.trim() };
    }

    const result = await dispatch(
      approveThunk({ id: request.id, data: payload }),
    );
    if (approveThunk.fulfilled.match(result)) {
      const labels = {
        approve: 'approved',
        approve_and_forward: 'approved and forwarded',
        approve_final: 'finally approved',
        deny: 'denied',
        rollback: 'rolled back',
      };
      const entityLabel = isRequestContext ? 'Request' : 'Expense';
      toast.success(
        `${entityLabel} ${labels[signAction] || signAction} successfully.`,
      );
      await fetchTrackingData();
      resetSignForm();
      if (onApprove) onApprove(request.id, payload.action, signNotes.trim());
    } else {
      toast.error(result.payload || `Failed to ${signAction}.`);
    }
  };

  if (!request) return null;

  // ── Shape normalisation ───────────────────────────────────────────────────
  //
  // Expense context:  td.expense   + td.expense_histories
  //   expense.can_approve            → canApprove
  //   histories[].has_signature      → isSigned
  //   histories[].user.name          → user name
  //   histories[].user.is_head_of_department
  //
  // Request context:  td.request   + td.request_histories
  //   no can_approve field           → derive from request.status
  //   histories[].signature (string) → isSigned = !!signature
  //   histories[].user.firstname/lastname
  //   histories[].is_user_head_of_department (top-level, not inside user)

  const td = trackingData || {};
  const isRequestContext = trackingStateKey === 'replenishRequestTrackingData';

  const entity = isRequestContext ? td.request || {} : td.expense || {};
  const histories = isRequestContext
    ? td.request_histories || []
    : td.expense_histories || [];

  // Normalised display values
  const displayAmount = isRequestContext
    ? entity.total_expenses
    : entity.amount;
  const displayCurrency = isRequestContext
    ? entity.currency || entity.expenses?.[0]?.currency || 'USD'
    : entity.currency;
  const displayDescription = isRequestContext
    ? entity.expenses?.[0]?.item_description || 'Replenishment Request'
    : entity.item_description || request.item_description || 'Expense';
  const displayStatus = entity.status || request.status;
  const displayDate = isRequestContext
    ? entity.created_at
    : entity.date || entity.created_at;
  const approvalLevel =
    entity.current_approval_level || td.current_approval_level;

  // canApprove: expense has explicit field; request derives from status
  const canApprove = isRequestContext
    ? !['approved', 'denied', 'rolled_back'].includes(
        entity.status?.toLowerCase(),
      )
    : (entity.can_approve ?? false);

  // History field normalisation helpers
  const historyUserName = (h) =>
    isRequestContext ? userName(h.user) : h.user?.name || userName(h.user);

  const historyIsSigned = (h) =>
    isRequestContext ? !!h.signature : !!h.has_signature;

  const historyIsHOD = (h) =>
    isRequestContext
      ? !!h.is_user_head_of_department
      : !!h.user?.is_head_of_department;

  // Step icon colour based on status
  const stepBgColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'signed') return '#66BB6A';
    if (s === 'denied') return '#EF5350';
    if (s === 'verified') return '#42A5F5';
    if (s === 'to_sign' || s === 'to sign') return '#FF9800';
    return '#9E9E9E';
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={handleClose_}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '92vh' } }}
    >
      {/* ── Header ── */}
      <Box sx={style.header}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {isRequestContext ? 'Track & Sign Request' : 'Track & Sign Expense'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            ID #{request.id} — {displayDescription}
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
        {/* ── Loading state ── */}
        {loadingTracking && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#00529B' }} />
          </Box>
        )}

        {!loadingTracking && (
          <>
            {/* ── Details section ── */}
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#00529B"
                gutterBottom
              >
                {isRequestContext ? 'Request Details' : 'Expense Details'}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {/* Amount */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={style.fieldLabel}>
                    {isRequestContext ? 'Total Amount' : 'Amount'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#00529B',
                    }}
                  >
                    {formatAmount(displayAmount)}{' '}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {displayCurrency}
                    </Typography>
                  </Typography>
                </Grid>

                {/* Status */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={style.fieldLabel}>Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip status={displayStatus} />
                  </Box>
                </Grid>

                {/* Date */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={style.fieldLabel}>
                    {isRequestContext ? 'Created At' : 'Date'}
                  </Typography>
                  <Typography sx={style.fieldValue}>
                    {displayDate
                      ? new Date(displayDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </Typography>
                </Grid>

                {/* Approval Level */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={style.fieldLabel}>Approval Level</Typography>
                  <Typography sx={style.fieldValue}>
                    {approvalLevel != null ? `Level ${approvalLevel}` : 'N/A'}
                  </Typography>
                </Grid>

                {/* Description / expense items */}
                <Grid item xs={12}>
                  <Typography sx={style.fieldLabel}>
                    {isRequestContext ? 'Expense Items' : 'Item Description'}
                  </Typography>
                  {isRequestContext ? (
                    entity.expenses?.length > 0 ? (
                      entity.expenses.map((exp, i) => (
                        <Box
                          key={exp.id || i}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            py: 0.75,
                            borderBottom:
                              i < entity.expenses.length - 1
                                ? '1px solid rgba(0,82,155,0.07)'
                                : 'none',
                          }}
                        >
                          <Typography variant="body2">
                            {i + 1}. {exp.item_description}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="#00529B"
                          >
                            {formatAmount(exp.amount)} {exp.currency}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography sx={style.fieldValue}>N/A</Typography>
                    )
                  ) : (
                    <Typography sx={style.fieldValue}>
                      {displayDescription}
                    </Typography>
                  )}
                </Grid>

                {/* Requester / Verifier — request context only */}
                {isRequestContext && entity.requester && (
                  <Grid item xs={12} sm={6}>
                    <Typography sx={style.fieldLabel}>Requester</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <AccountCircleIcon
                        sx={{ color: '#00529B', fontSize: 20 }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {userName(entity.requester)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {entity.requester.position}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {isRequestContext && entity.verifier && (
                  <Grid item xs={12} sm={6}>
                    <Typography sx={style.fieldLabel}>Verifier</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <VerifiedUserIcon
                        sx={{ color: '#42A5F5', fontSize: 20 }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {userName(entity.verifier)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {entity.verifier.position}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Request stats — request context only */}
                {isRequestContext && (
                  <>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={style.fieldLabel}>Expenses</Typography>
                      <Typography sx={style.fieldValue}>
                        {entity.expenses_count ?? entity.expenses?.length ?? 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={style.fieldLabel}>Signatures</Typography>
                      <Typography sx={style.fieldValue}>
                        {entity.signature_count ?? 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={style.fieldLabel}>Verified</Typography>
                      <Chip
                        label={entity.is_verified ? 'Yes' : 'No'}
                        size="small"
                        sx={{
                          bgcolor: entity.is_verified ? '#66BB6A' : '#9E9E9E',
                          color: 'white',
                          fontWeight: 600,
                          mt: 0.5,
                        }}
                      />
                    </Grid>
                  </>
                )}

                {/* Supporting documents */}
                {isRequestContext
                  ? // Request: per-expense documents
                    entity.expenses?.some((e) => e.supporting_document) && (
                      <Grid item xs={12}>
                        <Typography sx={style.fieldLabel}>
                          Supporting Documents
                        </Typography>
                        {entity.expenses
                          .filter((e) => e.supporting_document)
                          .map((exp, i) => (
                            <Box
                              key={i}
                              onClick={() =>
                                window.open(exp.supporting_document, '_blank')
                              }
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 0.75,
                                p: 1.25,
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
                                {exp.item_description} —{' '}
                                {exp.supporting_document.split('/').pop()}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: '#00529B', fontWeight: 600 }}
                              >
                                View
                              </Typography>
                            </Box>
                          ))}
                      </Grid>
                    )
                  : // Expense: single document
                    (entity.supporting_document_url ||
                      entity.supporting_document ||
                      request.supporting_document) && (
                      <Grid item xs={12}>
                        <Typography sx={style.fieldLabel}>
                          Supporting Document
                        </Typography>
                        <Box
                          onClick={() =>
                            window.open(
                              entity.supporting_document_url ||
                                entity.supporting_document ||
                                request.supporting_document,
                              '_blank',
                            )
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
                            {(
                              entity.supporting_document_url ||
                              entity.supporting_document ||
                              request.supporting_document
                            )
                              .split('/')
                              .pop()}
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

            {/* ── Approval History ── */}
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

              {histories.length > 0 ? (
                <Stepper orientation="vertical">
                  {histories.map((history) => (
                    <Step key={history.id} active completed={false}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: stepBgColor(history.status),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                            }}
                          >
                            {historyIsSigned(history) ? (
                              <VerifiedUserIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <PersonIcon sx={{ fontSize: 18 }} />
                            )}
                          </Box>
                        )}
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          {historyUserName(history)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {history.user?.position}
                          {history.approval_level != null
                            ? ` • Level ${history.approval_level}`
                            : ''}
                          {historyIsHOD(history) ? ' • Head of Dept' : ''}
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
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Status
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <StatusChip status={history.status} />
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Date
                              </Typography>
                              <Typography variant="body2">
                                {formatDate(
                                  history.updated_at || history.created_at,
                                )}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Department
                              </Typography>
                              <Typography variant="body2">
                                {history.user?.department || 'N/A'}
                              </Typography>
                            </Grid>

                            {/* Same department badge — request context only */}
                            {isRequestContext && (
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Same Department
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  <Chip
                                    label={
                                      history.is_in_same_department
                                        ? 'Yes'
                                        : 'No'
                                    }
                                    size="small"
                                    sx={{
                                      bgcolor: history.is_in_same_department
                                        ? '#66BB6A'
                                        : '#9E9E9E',
                                      color: 'white',
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                </Box>
                              </Grid>
                            )}

                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Digitally Signed
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <Chip
                                  icon={
                                    historyIsSigned(history) ? (
                                      <VerifiedUserIcon sx={{ fontSize: 14 }} />
                                    ) : undefined
                                  }
                                  label={
                                    historyIsSigned(history)
                                      ? 'Signed'
                                      : 'Not signed'
                                  }
                                  size="small"
                                  sx={{
                                    bgcolor: historyIsSigned(history)
                                      ? '#9C27B0'
                                      : '#e0e0e0',
                                    color: historyIsSigned(history)
                                      ? 'white'
                                      : '#666',
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                  }}
                                />
                              </Box>
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
                          </Grid>
                        </Paper>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              ) : (
                <Alert severity="info">
                  No approval history yet. History will appear once reviewers
                  act on this {isRequestContext ? 'request' : 'expense'}.
                </Alert>
              )}
            </Paper>

            {/* ── Take Action ── */}
            {canApprove && (
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
                    Review This {isRequestContext ? 'Request' : 'Expense'}
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
                        }}
                        label="Action *"
                      >
                        <MenuItem value="approve">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <ThumbUpIcon
                              sx={{ color: '#66BB6A', fontSize: 20 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                Approve
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Simple approval
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="approve_and_forward">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <ThumbUpIcon
                              sx={{ color: '#42A5F5', fontSize: 20 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                Approve & Forward
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Approve and assign next approver
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="approve_final">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CheckCircleIcon
                              sx={{ color: '#2E7D32', fontSize: 20 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                Final Approval
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Mark as finally approved
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="deny">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <ThumbDownIcon
                              sx={{ color: '#EF5350', fontSize: 20 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                Deny
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Reject this{' '}
                                {isRequestContext ? 'request' : 'expense'}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="rollback">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <UndoIcon sx={{ color: '#FF9800', fontSize: 20 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                Rollback
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
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
                          MenuProps={{
                            PaperProps: { style: { maxHeight: 300 } },
                          }}
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
                            ? 'e.g. Final approval granted'
                            : signAction === 'rollback'
                              ? 'e.g. Needs correction before re-submission'
                              : signAction === 'deny'
                                ? 'e.g. Insufficient documentation'
                                : 'Add any comments...'
                      }
                      required={
                        signAction === 'deny' || signAction === 'rollback'
                      }
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
                            <CircularProgress
                              size={18}
                              sx={{ color: 'white' }}
                            />
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
                            ? `Deny ${isRequestContext ? 'Request' : 'Expense'}`
                            : signAction === 'rollback'
                              ? 'Rollback'
                              : signAction === 'approve_and_forward'
                                ? 'Approve & Forward'
                                : signAction === 'approve_final'
                                  ? 'Final Approval'
                                  : `Approve ${isRequestContext ? 'Request' : 'Expense'}`}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            )}

            {/* ── Status banner ── */}
            {displayStatus &&
              ![
                'pending',
                'to_sign',
                'to_verify',
                'to sign',
                'to verify',
              ].includes(displayStatus?.toLowerCase()) && (
                <Alert
                  severity={
                    displayStatus?.toLowerCase() === 'approved'
                      ? 'success'
                      : displayStatus?.toLowerCase() === 'denied'
                        ? 'error'
                        : 'info'
                  }
                  sx={{ mt: 1 }}
                >
                  This {isRequestContext ? 'request' : 'expense'} has been{' '}
                  <strong>{displayStatus.replace(/_/g, ' ')}</strong>.
                </Alert>
              )}
          </>
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
