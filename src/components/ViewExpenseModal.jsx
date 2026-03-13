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

// ── Component ─────────────────────────────────────────────────────────────────
// Receives a single flat expense object from ManageExpenses:
// { id, date, item_description, amount, currency, supporting_document, created_at }

const ViewExpenseModal = ({ open, handleClose, expense }) => {
  if (!expense) return null;

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
        <IconButton edge="end" color="inherit" onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>

        {/* Amount hero */}
        <Paper elevation={0} sx={{ ...style.section, textAlign: 'center', py: 3 }}>
          <Typography
            sx={{ fontSize: '2rem', fontWeight: 700, color: '#00529B', lineHeight: 1 }}
          >
            {formatAmount(expense.amount)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
            Expense Amount
          </Typography>
          <Chip
            label={expense.currency || 'USD'}
            size="small"
            sx={{ bgcolor: '#00529B', color: 'white', fontWeight: 600 }}
          />
        </Paper>

        {/* Expense details */}
        <Paper elevation={0} sx={style.section}>
          <Typography variant="subtitle2" fontWeight={600} color="#00529B" gutterBottom>
            Expense Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Field label="Item Description" value={expense.item_description} />
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography sx={style.fieldLabel}>Expense Date</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.3 }}>
                  <CalendarTodayIcon sx={{ fontSize: 15, color: '#00529B' }} />
                  <Typography sx={style.fieldValue}>
                    {formatDateShort(expense.date)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Field label="Created At" value={formatDate(expense.created_at)} />
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
          </Grid>
        </Paper>

        {/* Supporting document */}
        {expense.supporting_document && (
          <Paper elevation={0} sx={style.section}>
            <Typography variant="subtitle2" fontWeight={600} color="#00529B" gutterBottom>
              Supporting Document
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Box
              onClick={() => window.open(expense.supporting_document, '_blank')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                bgcolor: 'rgba(0, 82, 155, 0.05)',
                borderRadius: 1,
                border: '1px solid rgba(0, 82, 155, 0.15)',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.1)' },
              }}
            >
              <AttachFileIcon sx={{ mr: 1, color: '#00529B', fontSize: 20 }} />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {expense.supporting_document.split('/').pop()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#00529B', fontWeight: 600 }}>
                View
              </Typography>
            </Box>
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
            '&:hover': { borderColor: '#003d73', bgcolor: 'rgba(0, 82, 155, 0.05)' },
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