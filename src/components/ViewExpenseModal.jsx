import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const style = {
  section: {
    mb: 2.5,
    p: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
    border: '1px solid rgba(0, 82, 155, 0.08)',
    borderRadius: 2,
  },
  fieldLabel: {
    fontSize: '0.74rem',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    display: 'block',
    mb: 0.3,
  },
  fieldValue: {
    fontSize: '0.94rem',
    color: '#222',
  },
};

const formatAmount = (a) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(a || 0));

const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateShort = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const Field = ({ label, value }) => (
  <Box>
    <Typography sx={style.fieldLabel}>{label}</Typography>
    <Typography sx={style.fieldValue}>{value || 'N/A'}</Typography>
  </Box>
);

// ── Status chip helper ────────────────────────────────────────────────────────
const statusMap = {
  pending: { bgcolor: '#FFA726', color: 'white' },
  approved: { bgcolor: '#66BB6A', color: 'white' },
  denied: { bgcolor: '#EF5350', color: 'white' },
  verified: { bgcolor: '#42A5F5', color: 'white' },
  rolled_back: { bgcolor: '#9E9E9E', color: 'white' },
  'to verify': { bgcolor: '#42A5F5', color: 'white' },
  'to sign': { bgcolor: '#FF9800', color: 'white' },
};

const StatusChip = ({ status }) => {
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
        ...(statusMap[status?.toLowerCase()] || {
          bgcolor: '#9E9E9E',
          color: 'white',
        }),
        fontWeight: 600,
        fontSize: '0.78rem',
      }}
    />
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
// expense shape from API:
// { id, date, item_description, amount, currency, status,
//   documents: [{ id, document_url, document_name, uploaded_by, created_at }],
//   created_by, forwarded_to, petty_cash_details, ... }

const ViewExpenseModal = ({ open, handleClose, expense }) => {
  if (!expense) return null;

  // Support both old shape (supporting_document string) and new shape (documents array)
  const documents =
    Array.isArray(expense.documents) && expense.documents.length > 0
      ? expense.documents
      : expense.supporting_document
        ? [
            {
              id: 0,
              document_url: expense.supporting_document,
              document_name: expense.supporting_document.split('/').pop(),
            },
          ]
        : [];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#00529B',
          color: 'white',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Expense Details
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              ID #{expense.id}
            </Typography>
          </Box>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Amount hero */}
        <Paper
          elevation={0}
          sx={{ ...style.section, textAlign: 'center', py: 3 }}
        >
          <Typography
            sx={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#00529B',
              lineHeight: 1,
            }}
          >
            {formatAmount(expense.amount)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 1.5 }}
          >
            Expense Amount
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Chip
              label={expense.currency || 'USD'}
              size="small"
              sx={{ bgcolor: '#00529B', color: 'white', fontWeight: 600 }}
            />
            {expense.status && <StatusChip status={expense.status} />}
          </Box>
        </Paper>

        {/* Expense details */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="#00529B"
            gutterBottom
          >
            Expense Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Field
                label="Item Description"
                value={expense.item_description}
              />
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography sx={style.fieldLabel}>Expense Date</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mt: 0.3,
                  }}
                >
                  <CalendarTodayIcon sx={{ fontSize: 15, color: '#00529B' }} />
                  <Typography sx={style.fieldValue}>
                    {formatDateShort(expense.date)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Field
                label="Created At"
                value={formatDate(expense.created_at)}
              />
            </Grid>
            <Grid item xs={6}>
              <Field
                label="Amount"
                value={`${formatAmount(expense.amount)} ${expense.currency || 'USD'}`}
              />
            </Grid>
            <Grid item xs={6}>
              <Field label="Currency" value={expense.currency || 'USD'} />
            </Grid>
            {/* Status row */}
            <Grid item xs={6}>
              <Typography sx={style.fieldLabel}>Status</Typography>
              <Box sx={{ mt: 0.3 }}>
                <StatusChip status={expense.status} />
              </Box>
            </Grid>
            {expense.created_by && (
              <Grid item xs={6}>
                <Field
                  label="Created By"
                  value={`${expense.created_by.firstname} ${expense.created_by.lastname}`}
                />
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Supporting Documents — updated to use documents array */}
        {documents.length > 0 && (
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Supporting Documents ({documents.length})
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            {documents.map((doc, index) => (
              <Box
                key={doc.id ?? index}
                onClick={() => window.open(doc.document_url, '_blank')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.5,
                  mb: index < documents.length - 1 ? 1 : 0,
                  bgcolor: 'rgba(0, 82, 155, 0.05)',
                  borderRadius: 1,
                  border: '1px solid rgba(0, 82, 155, 0.15)',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.1)' },
                }}
              >
                <AttachFileIcon
                  sx={{ mr: 1, color: '#00529B', fontSize: 20, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {doc.document_name ||
                      doc.document_url?.split('/').pop() ||
                      `Document ${index + 1}`}
                  </Typography>
                  {doc.uploaded_by && (
                    <Typography variant="caption" color="text.secondary">
                      Uploaded by {doc.uploaded_by}
                    </Typography>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#00529B',
                    fontWeight: 600,
                    flexShrink: 0,
                    ml: 1,
                  }}
                >
                  View
                </Typography>
              </Box>
            ))}
          </Paper>
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

export default ViewExpenseModal;
