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
    width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
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

const ViewTransactionModal = ({ open, handleClose, transaction }) => {
  const getStatusChip = (status) => {
    const statusColors = {
      active: { bgcolor: '#66BB6A', color: 'white' },
      exhausted: { bgcolor: '#EF5350', color: 'white' },
      pending: { bgcolor: '#FFA726', color: 'white' },
    };

    return (
      <Chip
        label={
          status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'
        }
        sx={{
          ...(statusColors[status] || { bgcolor: '#9E9E9E', color: 'white' }),
          fontWeight: 500,
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" fontWeight={600}>
            Transaction Details
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={style.content}>
          {/* Transaction Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Transaction Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Transaction ID</Typography>
                  <Typography sx={style.fieldValue}>
                    #{transaction?.id || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Status</Typography>
                  {getStatusChip(transaction?.status)}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Amount Issued</Typography>
                  <Typography sx={style.fieldValue}>
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                    }).format(transaction?.amount || 0)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>
                    Remaining Amount
                  </Typography>
                  <Typography sx={style.fieldValue}>
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                    }).format(transaction?.remaining_amount || 0)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Issue Date</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.issue_date || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Created At</Typography>
                  <Typography sx={style.fieldValue}>
                    {formatDate(transaction?.created_at)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Notes</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.notes || 'No notes provided'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Holder Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Holder Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Name</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.holder?.firstname}{' '}
                    {transaction?.holder?.lastname}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Position</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.holder?.position || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Email</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.holder?.email || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Department</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.holder?.department || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Section</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.holder?.section || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Station</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.holder?.station || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Issued By Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Issued By
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Name</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.issued_by?.firstname}{' '}
                    {transaction?.issued_by?.lastname}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Position</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.issued_by?.position || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Email</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.issued_by?.email || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Department</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.issued_by?.department || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Acknowledgment Information */}
          {transaction?.is_acknowledged && (
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#00529B"
                gutterBottom
              >
                Acknowledgment Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>Acknowledged</Typography>
                    <Chip
                      label="Yes"
                      size="small"
                      sx={{
                        bgcolor: '#66BB6A',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>
                      Acknowledged At
                    </Typography>
                    <Typography sx={style.fieldValue}>
                      {formatDate(transaction?.acknowledged_at)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>
                      Acknowledgment Notes
                    </Typography>
                    <Typography sx={style.fieldValue}>
                      {transaction?.acknowledgment_notes || 'No notes provided'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Supporting Document */}
          {transaction?.supporting_document && (
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
                  window.open(transaction.supporting_document, '_blank')
                }
              >
                <AttachFileIcon sx={{ mr: 1, color: '#00529B' }} />
                <Typography sx={{ flex: 1 }}>
                  {transaction.supporting_document.split('/').pop()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#00529B', fontWeight: 500 }}
                >
                  View Document
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewTransactionModal;
