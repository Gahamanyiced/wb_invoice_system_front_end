import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '75%', md: '55%', lg: '45%' },
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
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
    overflowY: 'auto',
    flex: 1,
  },
  section: {
    mb: 3,
    p: 2.5,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
    border: '1px solid rgba(0, 82, 155, 0.08)',
    borderRadius: 2,
  },
  fieldLabel: {
    fontSize: '0.8rem',
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

const ViewPettyCashRequestModal = ({ open, handleClose, request }) => {
  if (!request) return null;

  // API response shape:
  // { id, date, item_description, amount, currency, supporting_document, created_at }

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

  const Field = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography sx={style.fieldLabel}>{label}</Typography>
      <Typography sx={style.fieldValue}>{value || 'N/A'}</Typography>
    </Box>
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Expense Details
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              ID #{request.id}
            </Typography>
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

        {/* Content */}
        <Box sx={style.content}>
          {/* Expense Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Expense Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Field
                  label="Date"
                  value={
                    request.date
                      ? new Date(request.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
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
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={style.fieldLabel}>Amount</Typography>
                  <Typography
                    sx={{
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: '#00529B',
                    }}
                  >
                    {formatAmount(request.amount)}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 0.75 }}
                    >
                      {request.currency}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  label="Created At"
                  value={formatDate(request.created_at)}
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  label="Item Description"
                  value={request.item_description}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Supporting Document */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Supporting Document
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {request.supporting_document ? (
              <Box
                onClick={() =>
                  window.open(request.supporting_document, '_blank')
                }
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'rgba(0, 82, 155, 0.05)',
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: '1px solid rgba(0, 82, 155, 0.15)',
                  '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.1)' },
                }}
              >
                <AttachFileIcon sx={{ mr: 1.5, color: '#00529B' }} />
                <Typography variant="body2" sx={{ flex: 1, color: '#333' }}>
                  {request.supporting_document.split('/').pop()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#00529B', fontWeight: 600 }}
                >
                  View Document
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No document attached
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewPettyCashRequestModal;
