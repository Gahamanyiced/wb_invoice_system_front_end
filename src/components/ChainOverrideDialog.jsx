import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';
import SortIcon from '@mui/icons-material/Sort';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { toast } from 'react-toastify';
import {
  chainReplaceSigner,
  chainChangeStatus,
  chainReorder,
  chainInsertSigner,
  chainRemoveSigner,
} from '../features/invoice/invoiceSlice';
import { getAllSigners } from '../features/user/userSlice';

// ── Status options ─────────────────────────────────────────────────────────────
const INVOICE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  // { value: 'approved', label: 'Approved' },
  { value: 'rollback', label: 'Rollback' },
  { value: 'forwarded', label: 'Forwarded' },
];

const HISTORY_STATUSES = [
  { value: 'to_sign', label: 'To Sign' },
  // { value: 'signed', label: 'Signed' },
  { value: 'pending', label: 'Pending' },
  // { value: 'denied', label: 'Denied' },
];

// ── Shared styles ──────────────────────────────────────────────────────────────
const headerSx = {
  bgcolor: '#00529B',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const saveBtn = {
  backgroundColor: '#00529B',
  '&:hover': { backgroundColor: '#003f7a' },
};

// ── Helper: signer chip label ──────────────────────────────────────────────────
const signerLabel = (item) =>
  `${item?.signer?.firstname || ''} ${item?.signer?.lastname || ''}`.trim() ||
  `History #${item.id}`;

// ── Helper: resolve the correct invoice ID for chain endpoints ─────────────────
// The chain endpoints use invoice_histories[].invoice (e.g. 5) — the FK integer
// used in /invoice/invoices/{id}/chain/... URLs.
// invoice.invoice.id (e.g. 200588) is the tracking object ID — NOT what the
// chain endpoints expect.
const resolveChainInvoiceId = (invoice) => {
  if (invoice?.invoice?.invoice_id) return invoice.invoice.invoice_id; // ← PRIMARY
  const fromHistory = invoice?.invoice_histories?.[0]?.invoice;
  if (fromHistory) return fromHistory; // ← FALLBACK 1
  return invoice?.invoice?.id || invoice?.id; // ← FALLBACK 2
};

// ═════════════════════════════════════════════════════════════════════════════
// Tab panels
// ═════════════════════════════════════════════════════════════════════════════

// ── 1. Replace Signer ─────────────────────────────────────────────────────────
function ReplaceSignerTab({ invoice, invoiceId, signersList, onSuccess }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.invoice);

  const histories = invoice?.invoice_histories || [];

  const [historyId, setHistoryId] = useState('');
  const [newSigner, setNewSigner] = useState(null);
  const [reason, setReason] = useState('');

  const signerOptions = signersList.map((s) => ({
    id: s.id,
    label: `${s.firstname} ${s.lastname}`,
  }));

  const handleSubmit = async () => {
    if (!historyId || !newSigner || !reason.trim()) {
      toast.error('All fields are required');
      return;
    }
    const res = await dispatch(
      chainReplaceSigner({
        invoiceId,
        data: { history_id: historyId, new_signer_id: newSigner.id, reason },
      }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Signer replaced successfully');
      setHistoryId('');
      setNewSigner(null);
      setReason('');
      onSuccess();
    } else {
      toast.error(res.payload || 'Failed to replace signer');
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Replace an existing signer in the approval chain with a different
        person.
      </Typography>

      <TextField
        select
        label="Signer to replace *"
        value={historyId}
        onChange={(e) => setHistoryId(e.target.value)}
        size="small"
        fullWidth
      >
        {histories.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={item.status?.toUpperCase()}
                size="small"
                color={
                  item.status === 'signed'
                    ? 'success'
                    : item.status === 'denied'
                      ? 'error'
                      : 'default'
                }
                sx={{ fontSize: '10px', height: 18 }}
              />
              <span>{signerLabel(item)}</span>
            </Box>
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        options={signerOptions}
        value={newSigner}
        onChange={(_, v) => setNewSigner(v)}
        isOptionEqualToValue={(o, v) => o.id === v?.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="New signer *"
            size="small"
            placeholder="Search by name..."
          />
        )}
        noOptionsText="No signers found"
      />

      <TextField
        label="Reason *"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        size="small"
        fullWidth
        multiline
        rows={2}
        placeholder="e.g. Cedric is unavailable, replacing with Lys."
      />

      <Button
        variant="contained"
        sx={saveBtn}
        disabled={isLoading}
        onClick={handleSubmit}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <SwapHorizIcon />
          )
        }
      >
        {isLoading ? 'Replacing...' : 'Replace Signer'}
      </Button>
    </Stack>
  );
}

// ── 2. Change Status ──────────────────────────────────────────────────────────
function ChangeStatusTab({ invoice, invoiceId, onSuccess }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.invoice);

  const histories = invoice?.invoice_histories || [];
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = loggedInUser?.role === 'admin';
  // ── added: invoice verifier can also target the invoice itself ────────────
  const isInvoiceVerifier = !!loggedInUser?.is_invoice_verifier;
  const canTargetInvoice = isAdmin || isInvoiceVerifier;

  const [target, setTarget] = useState(
    canTargetInvoice ? 'invoice' : 'history',
  );
  const [historyId, setHistoryId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!newStatus || !reason.trim()) {
      toast.error('Status and reason are required');
      return;
    }
    if (target === 'history' && !historyId) {
      toast.error('Please select a history entry');
      return;
    }

    const payload =
      target === 'invoice'
        ? { target: 'invoice', new_status: newStatus, reason }
        : {
            target: 'history',
            history_id: historyId,
            new_status: newStatus,
            reason,
          };

    const res = await dispatch(chainChangeStatus({ invoiceId, data: payload }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Status changed successfully');
      // ── updated: reset to correct default based on permission ─────────────
      setTarget(canTargetInvoice ? 'invoice' : 'history');
      setHistoryId('');
      setNewStatus('');
      setReason('');
      onSuccess();
    } else {
      toast.error(res.payload || 'Failed to change status');
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Change the status of the invoice itself or a specific signer's history
        entry.
      </Typography>

      <TextField
        select
        label="Target *"
        value={target}
        onChange={(e) => {
          setTarget(e.target.value);
          setHistoryId('');
          setNewStatus('');
        }}
        size="small"
        fullWidth
      >
        {/* ── updated: show "Invoice" target to admin OR invoice verifier ── */}
        {canTargetInvoice && <MenuItem value="invoice">Invoice</MenuItem>}
        <MenuItem value="history">Signer History Entry</MenuItem>
      </TextField>

      {target === 'history' && (
        <TextField
          select
          label="History entry *"
          value={historyId}
          onChange={(e) => setHistoryId(e.target.value)}
          size="small"
          fullWidth
        >
          {histories.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={item.status?.toUpperCase()}
                  size="small"
                  color={
                    item.status === 'signed'
                      ? 'success'
                      : item.status === 'denied'
                        ? 'error'
                        : 'default'
                  }
                  sx={{ fontSize: '10px', height: 18 }}
                />
                <span>{signerLabel(item)}</span>
              </Box>
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        select
        label="New status *"
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        size="small"
        fullWidth
      >
        {(target === 'invoice' ? INVOICE_STATUSES : HISTORY_STATUSES).map(
          (s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ),
        )}
      </TextField>

      <TextField
        label="Reason *"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        size="small"
        fullWidth
        multiline
        rows={2}
        placeholder="e.g. Sent back for correction."
      />

      <Button
        variant="contained"
        sx={saveBtn}
        disabled={isLoading}
        onClick={handleSubmit}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <EditIcon />
          )
        }
      >
        {isLoading ? 'Saving...' : 'Change Status'}
      </Button>
    </Stack>
  );
}

// ── 3. Reorder Chain ──────────────────────────────────────────────────────────
function ReorderChainTab({ invoice, invoiceId, onSuccess }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.invoice);

  const histories = invoice?.invoice_histories || [];

  const [ordered, setOrdered] = useState([]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    setOrdered(histories.map((h) => h.id));
  }, [invoice]);

  const moveUp = (idx) => {
    if (idx === 0) return;
    const arr = [...ordered];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setOrdered(arr);
  };
  const moveDown = (idx) => {
    if (idx === ordered.length - 1) return;
    const arr = [...ordered];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setOrdered(arr);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    const res = await dispatch(
      chainReorder({ invoiceId, data: { order: ordered, reason } }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Chain reordered successfully');
      setReason('');
      onSuccess();
    } else {
      toast.error(res.payload || 'Failed to reorder chain');
    }
  };

  const getHistoryItem = (id) => histories.find((h) => h.id === id);

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Drag the signers into the desired signing order. Use the ↑↓ buttons to
        move them.
      </Typography>

      <Paper variant="outlined" sx={{ p: 1 }}>
        {ordered.map((id, idx) => {
          const item = getHistoryItem(id);
          if (!item) return null;
          return (
            <Box
              key={id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1,
                mb: 0.5,
                bgcolor: 'rgba(0,82,155,0.04)',
                border: '1px solid #e0e0e0',
              }}
            >
              <DragIndicatorIcon sx={{ color: '#999', fontSize: 18 }} />
              <Chip
                label={`#${idx + 1}`}
                size="small"
                sx={{ fontSize: '11px', minWidth: 28 }}
              />
              <Chip
                label={item.status?.toUpperCase()}
                size="small"
                color={
                  item.status === 'signed'
                    ? 'success'
                    : item.status === 'denied'
                      ? 'error'
                      : 'default'
                }
                sx={{ fontSize: '10px', height: 18 }}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {signerLabel(item)}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ minWidth: 28, px: 0.5 }}
                  disabled={idx === 0}
                  onClick={() => moveUp(idx)}
                >
                  ↑
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ minWidth: 28, px: 0.5 }}
                  disabled={idx === ordered.length - 1}
                  onClick={() => moveDown(idx)}
                >
                  ↓
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Paper>

      <TextField
        label="Reason *"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        size="small"
        fullWidth
        multiline
        rows={2}
        placeholder="e.g. Eric should sign before Lys."
      />

      <Button
        variant="contained"
        sx={saveBtn}
        disabled={isLoading}
        onClick={handleSubmit}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <SortIcon />
          )
        }
      >
        {isLoading ? 'Reordering...' : 'Save New Order'}
      </Button>
    </Stack>
  );
}

// ── 4. Insert Signer ──────────────────────────────────────────────────────────
function InsertSignerTab({ invoice, invoiceId, signersList, onSuccess }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.invoice);

  const histories = invoice?.invoice_histories || [];

  const [newSigner, setNewSigner] = useState(null);
  const [insertAfterHistoryId, setInsertAfterHistoryId] = useState('beginning');
  const [reason, setReason] = useState('');

  const signerOptions = signersList.map((s) => ({
    id: s.id,
    label: `${s.firstname} ${s.lastname}`,
  }));

  const handleSubmit = async () => {
    if (!newSigner || !reason.trim()) {
      toast.error('Signer and reason are required');
      return;
    }

    const afterId =
      insertAfterHistoryId === 'beginning' ? null : insertAfterHistoryId;

    const res = await dispatch(
      chainInsertSigner({
        invoiceId,
        data: {
          signer_id: newSigner.id,
          insert_after_history_id: afterId,
          reason,
        },
      }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Signer inserted into chain');
      setNewSigner(null);
      setInsertAfterHistoryId('beginning');
      setReason('');
      onSuccess();
    } else {
      toast.error(res.payload || 'Failed to insert signer');
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Add a new signer into the chain at a specific position.
      </Typography>

      <Autocomplete
        options={signerOptions}
        value={newSigner}
        onChange={(_, v) => setNewSigner(v)}
        isOptionEqualToValue={(o, v) => o.id === v?.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Signer to insert *"
            size="small"
            placeholder="Search by name..."
          />
        )}
        noOptionsText="No signers found"
      />

      <TextField
        select
        label="Insert position *"
        value={insertAfterHistoryId}
        onChange={(e) => setInsertAfterHistoryId(e.target.value)}
        size="small"
        fullWidth
      >
        <MenuItem value="beginning">
          <em>At the beginning of the chain</em>
        </MenuItem>
        {histories.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mr: 0.5 }}
              >
                After:
              </Typography>
              <Chip
                label={item.status?.toUpperCase()}
                size="small"
                color={
                  item.status === 'signed'
                    ? 'success'
                    : item.status === 'denied'
                      ? 'error'
                      : 'default'
                }
                sx={{ fontSize: '10px', height: 18 }}
              />
              <span>{signerLabel(item)}</span>
            </Box>
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Reason *"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        size="small"
        fullWidth
        multiline
        rows={2}
        placeholder="e.g. CFO approval required for this amount."
      />

      <Button
        variant="contained"
        sx={saveBtn}
        disabled={isLoading}
        onClick={handleSubmit}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <PersonAddIcon />
          )
        }
      >
        {isLoading ? 'Inserting...' : 'Insert Signer'}
      </Button>
    </Stack>
  );
}

// ── 5. Remove Signer ──────────────────────────────────────────────────────────
function RemoveSignerTab({ invoice, invoiceId, onSuccess }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.invoice);

  const histories = invoice?.invoice_histories || [];

  const [historyId, setHistoryId] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!historyId || !reason.trim()) {
      toast.error('Please select a signer and provide a reason');
      return;
    }
    const res = await dispatch(
      chainRemoveSigner({ invoiceId, data: { history_id: historyId, reason } }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Signer removed from chain');
      setHistoryId('');
      setReason('');
      onSuccess();
    } else {
      toast.error(res.payload || 'Failed to remove signer');
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Remove a signer from the approval chain permanently.
      </Typography>

      <TextField
        select
        label="Signer to remove *"
        value={historyId}
        onChange={(e) => setHistoryId(e.target.value)}
        size="small"
        fullWidth
      >
        {histories.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={item.status?.toUpperCase()}
                size="small"
                color={
                  item.status === 'signed'
                    ? 'success'
                    : item.status === 'denied'
                      ? 'error'
                      : 'default'
                }
                sx={{ fontSize: '10px', height: 18 }}
              />
              <span>{signerLabel(item)}</span>
            </Box>
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Reason *"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        size="small"
        fullWidth
        multiline
        rows={2}
        placeholder="e.g. Signer no longer required for this amount."
      />

      <Button
        variant="contained"
        color="error"
        disabled={isLoading}
        onClick={handleSubmit}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <PersonRemoveIcon />
          )
        }
      >
        {isLoading ? 'Removing...' : 'Remove Signer'}
      </Button>
    </Stack>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main dialog
// ═════════════════════════════════════════════════════════════════════════════
const TABS = [
  { label: 'Replace Signer', icon: <SwapHorizIcon sx={{ fontSize: 16 }} /> },
  { label: 'Change Status', icon: <EditIcon sx={{ fontSize: 16 }} /> },
  { label: 'Reorder Chain', icon: <SortIcon sx={{ fontSize: 16 }} /> },
  { label: 'Insert Signer', icon: <PersonAddIcon sx={{ fontSize: 16 }} /> },
  { label: 'Remove Signer', icon: <PersonRemoveIcon sx={{ fontSize: 16 }} /> },
];

function ChainOverrideDialog({ open, onClose, invoice, onSuccess }) {
  const dispatch = useDispatch();

  const rawUsers = useSelector((s) => s.user.users);
  const signersList = Array.isArray(rawUsers)
    ? rawUsers
    : rawUsers?.results || [];

  const [activeTab, setActiveTab] = useState(0);

  // ── Resolve correct invoice ID for chain API endpoints ─────────────────────
  // invoice_histories[].invoice is the FK integer (e.g. 5) used in the chain
  // URL: /invoice/invoices/{id}/chain/...
  // invoice.invoice.id (e.g. 200588) is the tracking object — NOT what chain
  // endpoints expect.
  const invoiceId = resolveChainInvoiceId(invoice);

  useEffect(() => {
    if (open) {
      dispatch(getAllSigners());
    }
  }, [open, dispatch]);

  const handleSuccess = () => {
    onSuccess(); // triggers getInvoiceTrackingData in parent
  };

  const tabProps = {
    invoice,
    invoiceId,
    signersList,
    onSuccess: handleSuccess,
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={headerSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon sx={{ fontSize: 20 }} />
          <Typography variant="h6" fontWeight={500}>
            Manage Signing Chain
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Tab bar */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f8fc' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: '12px',
              minHeight: 42,
              textTransform: 'none',
            },
            '& .Mui-selected': { color: '#00529B !important', fontWeight: 600 },
            '& .MuiTabs-indicator': { backgroundColor: '#00529B' },
          }}
        >
          {TABS.map((tab, idx) => (
            <Tab
              key={idx}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 2, pb: 1, minHeight: 320 }}>
        {/* Current chain summary */}
        {invoice?.invoice_histories?.length > 0 && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: '#f5f8fc',
              borderRadius: 1,
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              display="block"
              mb={0.5}
            >
              CURRENT CHAIN ({invoice.invoice_histories.length} signers) —
              Invoice ID: {invoiceId}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {invoice.invoice_histories.map((item, i) => (
                <Tooltip key={item.id} title={`History ID: ${item.id}`}>
                  <Chip
                    size="small"
                    label={`${i + 1}. ${signerLabel(item)}`}
                    color={
                      item.status === 'signed'
                        ? 'success'
                        : item.status === 'denied'
                          ? 'error'
                          : item.status === 'to_sign'
                            ? 'primary'
                            : 'default'
                    }
                    variant={item.status === 'signed' ? 'filled' : 'outlined'}
                    sx={{ fontSize: '11px' }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}

        {/* Tab panels */}
        {activeTab === 0 && <ReplaceSignerTab {...tabProps} />}
        {activeTab === 1 && <ChangeStatusTab {...tabProps} />}
        {activeTab === 2 && <ReorderChainTab {...tabProps} />}
        {activeTab === 3 && <InsertSignerTab {...tabProps} />}
        {activeTab === 4 && <RemoveSignerTab {...tabProps} />}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChainOverrideDialog;
