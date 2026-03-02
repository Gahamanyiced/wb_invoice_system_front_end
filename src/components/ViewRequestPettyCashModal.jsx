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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

// ── Styles ────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const StatusChip = ({ status }) => {
  const map = {
    pending: '#FFA726',
    approved: '#66BB6A',
    denied: '#EF5350',
    verified: '#42A5F5',
    rolled_back: '#9E9E9E',
    to_sign: '#FF9800',
    to_verify: '#42A5F5',
  };
  const key = status?.toLowerCase().replace(/ /g, '_');
  const label = (status || 'N/A').replace(/_/g, ' ');
  return (
    <Chip
      label={label.charAt(0).toUpperCase() + label.slice(1)}
      size="small"
      sx={{ bgcolor: map[key] || '#9E9E9E', color: 'white', fontWeight: 600 }}
    />
  );
};

const Field = ({ label, value }) => (
  <Box>
    <Typography sx={style.fieldLabel}>{label}</Typography>
    <Typography sx={style.fieldValue}>{value || 'N/A'}</Typography>
  </Box>
);

// ── Component ─────────────────────────────────────────────────────────────────

const ViewRequestPettyCashModal = ({ open, handleClose, request }) => {
  if (!request) return null;

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
              Petty Cash Request
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              ID #{request.id}
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
        {/* Status + Amount */}
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
            {formatAmount(request.total_expenses)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Total Request Amount
          </Typography>
          <StatusChip status={request.status} />
        </Paper>

        {/* People */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="#00529B"
            gutterBottom
          >
            People
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {request.requester && (
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}
                >
                  <AccountCircleIcon
                    sx={{ color: '#00529B', fontSize: 22, mt: 0.2 }}
                  />
                  <Box>
                    <Typography sx={style.fieldLabel}>Requester</Typography>
                    <Typography sx={style.fieldValue} fontWeight={500}>
                      {request.requester.firstname} {request.requester.lastname}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {request.requester.position}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.requester.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            {request.verifier && (
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}
                >
                  <VerifiedUserIcon
                    sx={{ color: '#42A5F5', fontSize: 22, mt: 0.2 }}
                  />
                  <Box>
                    <Typography sx={style.fieldLabel}>Verifier</Typography>
                    <Typography sx={style.fieldValue} fontWeight={500}>
                      {request.verifier.firstname} {request.verifier.lastname}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {request.verifier.position}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.verifier.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Request Details */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="#00529B"
            gutterBottom
          >
            Request Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Field
                label="Created At"
                value={formatDate(request.created_at)}
              />
            </Grid>
            <Grid item xs={6}>
              <Field
                label="Number of Expenses"
                value={`${request.expenses?.length || 0} item(s)`}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Expense Items */}
        {request.expenses?.length > 0 && (
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Expense Items
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            {request.expenses.map((expense, i) => (
              <Box
                key={expense.id || i}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom:
                    i < request.expenses.length - 1
                      ? '1px solid rgba(0,82,155,0.07)'
                      : 'none',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {i + 1}. {expense.item_description || 'N/A'}
                  </Typography>
                  {expense.date && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight={700} color="#00529B">
                    {formatAmount(expense.amount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {expense.currency}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Total row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 1.5,
                mt: 0.5,
                borderTop: '2px solid rgba(0, 82, 155, 0.15)',
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="body1" fontWeight={700} color="#00529B">
                {formatAmount(request.total_expenses)}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Supporting Documents */}
        {request.expenses?.some((e) => e.supporting_document) && (
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Supporting Documents
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            {request.expenses
              .filter((e) => e.supporting_document)
              .map((expense, i) => (
                <Box
                  key={i}
                  onClick={() =>
                    window.open(expense.supporting_document, '_blank')
                  }
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.25,
                    mb: 1,
                    bgcolor: 'rgba(0, 82, 155, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(0, 82, 155, 0.15)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.1)' },
                  }}
                >
                  <AttachFileIcon
                    sx={{ mr: 1, color: '#00529B', fontSize: 18 }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {expense.supporting_document.split('/').pop()}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: '#00529B', fontWeight: 600 }}
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

export default ViewRequestPettyCashModal;
