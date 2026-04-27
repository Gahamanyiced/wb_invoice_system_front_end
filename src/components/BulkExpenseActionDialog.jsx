// src/components/BulkExpenseActionDialog.jsx
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ReplayIcon from '@mui/icons-material/Replay';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ForwardIcon from '@mui/icons-material/Forward';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { bulkActionPettyCashExpenses } from '../features/pettyCash/pettyCashSlice';
import http from '../http-common';

// ── Action config ─────────────────────────────────────────────────────────────
const ACTION_OPTIONS = [
  {
    value: 'approve_and_forward',
    label: 'Approve & Forward',
    description: 'Approve all selected and assign next approver',
    icon: <ForwardIcon sx={{ color: '#42A5F5', fontSize: 20 }} />,
    requiresNotes: false,
    requiresNextApprover: true,
  },
  {
    value: 'approve_final',
    label: 'Final Approval',
    description: 'Give final approval to all selected expenses',
    icon: <VerifiedUserIcon sx={{ color: '#66BB6A', fontSize: 20 }} />,
    requiresNotes: false,
    requiresNextApprover: false,
  },
  {
    value: 'deny',
    label: 'Deny',
    description: 'Deny all selected expenses',
    icon: <ThumbDownIcon sx={{ color: '#EF5350', fontSize: 20 }} />,
    requiresNotes: true,
    requiresNextApprover: false,
  },
  {
    value: 'rollback',
    label: 'Rollback',
    description: 'Roll back all selected expenses for review',
    icon: <ReplayIcon sx={{ color: '#FF9800', fontSize: 20 }} />,
    requiresNotes: true,
    requiresNextApprover: false,
  },
];

const actionColor = {
  approve_and_forward: '#00529B',
  approve_final: '#2e7d32',
  deny: '#c62828',
  rollback: '#e65100',
};

// ── Component ─────────────────────────────────────────────────────────────────
const BulkExpenseActionDialog = ({
  open,
  onClose,
  selectedExpenses, // array of full expense objects
  onSuccess, // callback → refreshList() + clearSelection()
}) => {
  const dispatch = useDispatch();
  const isSubmitting = useRef(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [nextApproverId, setNextApprover] = useState('');
  const [notesError, setNotesError] = useState('');
  const [approverError, setApproverError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Next approver list (fetched on open, role-aware) ─────────────────────
  const [availableSigners, setAvailableSigners] = useState([]);
  const [loadingSigners, setLoadingSigners] = useState(false);

  // ── Logged-in user ────────────────────────────────────────────────────────
  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  // ── Role flags (same names as TrackAndSignPettyCashDialog) ────────────────
  const isCustodian = loggedInUser?.is_custodian === true;
  const isFirstApprover = loggedInUser?.is_first_approver === true;
  const isSecondApprover = loggedInUser?.is_second_approver === true;
  const isLastApprover = loggedInUser?.is_last_approver === true;

  // Last-only approver → Final Approval; everyone else → Approve & Forward
  const showFinal =
    isLastApprover && !isCustodian && !isFirstApprover && !isSecondApprover;

  const visibleActions = ACTION_OPTIONS.filter((a) => {
    if (a.value === 'approve_final') return showFinal;
    if (a.value === 'approve_and_forward') return !showFinal;
    return true; // deny + rollback always visible
  });

  // ── Fetch role-aware next approvers — mirrors TrackAndSignPettyCashDialog ─
  const fetchNextApprovers = async () => {
    let nextApproverFlag = null;
    if (isCustodian) nextApproverFlag = 'is_first_approver';
    else if (isFirstApprover) nextApproverFlag = 'is_second_approver';
    else if (isSecondApprover) nextApproverFlag = 'is_last_approver';

    if (!nextApproverFlag) {
      setAvailableSigners([]);
      return;
    }

    setLoadingSigners(true);
    try {
      const [signerRes, signerAdminRes] = await Promise.all([
        http.get('/auth/user-list/', {
          params: {
            [nextApproverFlag]: true,
            is_petty_cash_user: true,
            is_approved: true,
            role: 'signer',
          },
        }),
        http.get('/auth/user-list/', {
          params: {
            [nextApproverFlag]: true,
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
        (user, idx, self) => idx === self.findIndex((u) => u.id === user.id),
      );
      setAvailableSigners(unique);
    } catch (err) {
      console.error('Failed to fetch next approvers:', err);
      setAvailableSigners([]);
    } finally {
      setLoadingSigners(false);
    }
  };

  // ── Fetch on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) fetchNextApprovers();
  }, [open]); // eslint-disable-line

  // ── Reset on close ────────────────────────────────────────────────────────
  const handleClose = () => {
    if (isSubmitting.current) return;
    setAction('');
    setNotes('');
    setNextApprover('');
    setNotesError('');
    setApproverError('');
    onClose();
  };

  const expenseIds = selectedExpenses.map((e) => e.id);
  const selectedAction = ACTION_OPTIONS.find((a) => a.value === action);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSubmitting.current) return;

    if (!action) {
      toast.error('Please select an action');
      return;
    }

    if (selectedAction?.requiresNotes && !notes.trim()) {
      setNotesError('Notes are required for this action');
      return;
    }
    if (action === 'approve_and_forward' && !nextApproverId) {
      setApproverError('Please select the next approver');
      return;
    }
    setNotesError('');
    setApproverError('');

    // Build payload — matches bulk-action endpoint shapes
    let payload;
    if (action === 'approve_and_forward') {
      payload = {
        expense_ids: expenseIds,
        action: 'approve',
        notes: notes.trim(),
        next_approver_id: nextApproverId,
      };
    } else if (action === 'approve_final') {
      payload = {
        expense_ids: expenseIds,
        action: 'approve',
        notes: notes.trim(),
        final_approval: true,
      };
    } else {
      // deny | rollback
      payload = { expense_ids: expenseIds, action, notes: notes.trim() };
    }

    isSubmitting.current = true;
    setIsLoading(true);

    // Track success separately — handleClose() has a guard that checks
    // isSubmitting.current, so we must clear it first before calling it.
    let succeeded = false;

    try {
      const result = await dispatch(bulkActionPettyCashExpenses(payload));
      if (bulkActionPettyCashExpenses.fulfilled.match(result)) {
        const labels = {
          approve_and_forward: 'approved and forwarded',
          approve_final: 'finally approved',
          deny: 'denied',
          rollback: 'rolled back',
        };
        toast.success(
          `${expenseIds.length} expense${expenseIds.length !== 1 ? 's' : ''} ${labels[action]} successfully`,
        );
        succeeded = true;
      } else {
        toast.error(result.payload || 'Bulk action failed');
      }
    } finally {
      // Clear the guard FIRST, then close + refresh if successful
      isSubmitting.current = false;
      setIsLoading(false);
      if (succeeded) {
        handleClose(); // resets form state and calls onClose()
        onSuccess(); // refreshList() + clearSelection()
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          bgcolor: '#00529B',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <GroupsIcon sx={{ fontSize: 24 }} />
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
              Bulk Action
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {expenseIds.length} expense{expenseIds.length !== 1 ? 's' : ''}{' '}
              selected
            </Typography>
          </Box>
        </Box>
        <Button
          onClick={handleClose}
          sx={{ color: 'white', minWidth: 0, p: 0.5 }}
        >
          <CloseIcon />
        </Button>
      </Box>

      <DialogContent sx={{ pt: 2.5 }}>
        {/* Selected expenses chips */}
        <Box
          sx={{
            mb: 2.5,
            p: 1.5,
            bgcolor: '#f0f4f8',
            borderRadius: '8px',
            border: '1px solid #e0e8f0',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#555',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'block',
              mb: 1,
            }}
          >
            Selected Expenses
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {selectedExpenses.slice(0, 8).map((exp) => (
              <Chip
                key={exp.id}
                label={
                  exp.item_description
                    ? `#${exp.id} — ${exp.item_description.slice(0, 20)}${exp.item_description.length > 20 ? '…' : ''}`
                    : `#${exp.id}`
                }
                size="small"
                sx={{
                  fontSize: '11px',
                  bgcolor: '#e3effc',
                  color: '#1565c0',
                  height: '22px',
                }}
              />
            ))}
            {selectedExpenses.length > 8 && (
              <Chip
                label={`+${selectedExpenses.length - 8} more`}
                size="small"
                sx={{ fontSize: '11px', bgcolor: '#e0e0e0', height: '22px' }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* ── Action selector ── */}
        <FormControl fullWidth sx={{ mb: 2.5 }}>
          <InputLabel>Action *</InputLabel>
          <Select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setNotesError('');
              setApproverError('');
              setNextApprover('');
            }}
            label="Action *"
          >
            {visibleActions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  {opt.icon}
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {opt.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {opt.description}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ── Next approver — approve_and_forward only ─────────────────────── */}
        {action === 'approve_and_forward' && (
          <FormControl fullWidth sx={{ mb: 2.5 }} error={!!approverError}>
            <InputLabel>Next Approver *</InputLabel>
            <Select
              value={nextApproverId}
              onChange={(e) => {
                setNextApprover(e.target.value);
                setApproverError('');
              }}
              label="Next Approver *"
              disabled={loadingSigners}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              <MenuItem value="" disabled>
                {loadingSigners ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={14} />
                    <em>Loading next approvers...</em>
                  </Box>
                ) : availableSigners.length === 0 ? (
                  <em>No eligible next approvers</em>
                ) : (
                  <em>Select next approver</em>
                )}
              </MenuItem>
              {availableSigners.map((signer) => (
                <MenuItem key={signer.id} value={signer.id} sx={{ py: 1.25 }}>
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
            {approverError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.5 }}
              >
                {approverError}
              </Typography>
            )}
          </FormControl>
        )}

        {/* ── Notes ── */}
        <TextField
          label={
            action === 'deny' || action === 'rollback'
              ? 'Notes (Required) *'
              : 'Notes (Optional)'
          }
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (notesError) setNotesError('');
          }}
          fullWidth
          multiline
          rows={3}
          size="small"
          error={!!notesError}
          helperText={notesError}
          placeholder={
            action === 'approve_and_forward'
              ? 'e.g. Forwarding for final review...'
              : action === 'deny'
                ? 'Reason for denial...'
                : action === 'rollback'
                  ? 'Reason for rollback...'
                  : 'Optional notes...'
          }
        />

        {/* Warning for destructive bulk actions */}
        {(action === 'deny' || action === 'rollback') &&
          expenseIds.length > 1 && (
            <Alert
              severity="warning"
              sx={{ mt: 2, borderRadius: '8px', fontSize: '12.5px' }}
            >
              This will <strong>{action}</strong> all {expenseIds.length}{' '}
              selected expenses at once.
            </Alert>
          )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{ textTransform: 'none', color: '#555' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !action}
          startIcon={
            isLoading ? (
              <CircularProgress size={15} color="inherit" />
            ) : (
              selectedAction?.icon
            )
          }
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            px: 3,
            bgcolor: action ? actionColor[action] : '#00529B',
            '&:hover': { filter: 'brightness(0.9)' },
          }}
        >
          {isLoading
            ? 'Processing...'
            : action
              ? `${selectedAction?.label} (${expenseIds.length})`
              : 'Select an action'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkExpenseActionDialog;
