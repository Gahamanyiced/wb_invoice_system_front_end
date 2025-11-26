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
      pending: { bgcolor: '#FFA726', color: 'white' },
      approved: { bgcolor: '#66BB6A', color: 'white' },
      denied: { bgcolor: '#EF5350', color: 'white' },
      acknowledged: { bgcolor: '#42A5F5', color: 'white' },
    };

    return (
      <Chip
        label={status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
        sx={{
          ...(statusColors[status] || { bgcolor: '#9E9E9E', color: 'white' }),
          fontWeight: 500,
        }}
      />
    );
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" component="h2" fontWeight="500">
            Transaction Details
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={style.content}>
          {/* Basic Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 2 }}
            >
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Transaction ID</Typography>
                  <Typography sx={style.fieldValue}>
                    #{transaction?.id || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Status</Typography>
                  {getStatusChip(transaction?.status)}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Title</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.title || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>CM</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.cm || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Amount</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.amount
                      ? new Intl.NumberFormat('en-RW', {
                          style: 'currency',
                          currency: 'RWF',
                        }).format(transaction.amount)
                      : 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Payment Date</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.paymentDate || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Description</Typography>
                  <Typography sx={style.fieldValue}>
                    {transaction?.description || 'No description provided'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Supporting Documents */}
          {transaction?.documents && transaction.documents.length > 0 && (
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="#00529B"
                sx={{ mb: 2 }}
              >
                Supporting Documents
              </Typography>

              {transaction.documents.map((doc, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    mb: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <AttachFileIcon
                    sx={{ mr: 1, color: '#00529B', fontSize: 20 }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {doc.name || doc}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewTransactionModal;