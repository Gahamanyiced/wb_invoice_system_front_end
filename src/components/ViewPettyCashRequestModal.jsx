import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '85%', md: '75%', lg: '70%' },
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
  tableHeader: {
    bgcolor: 'rgba(0, 82, 155, 0.08)',
    '& th': {
      fontWeight: 600,
      color: '#00529B',
    },
  },
};

const ViewPettyCashRequestModal = ({ open, handleClose, request }) => {
  const getStatusChip = (status) => {
    const statusColors = {
      pending: { bgcolor: '#FFA726', color: 'white' },
      approved: { bgcolor: '#66BB6A', color: 'white' },
      denied: { bgcolor: '#EF5350', color: 'white' },
      signed: { bgcolor: '#42A5F5', color: 'white' },
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

  const calculateTotalAmount = () => {
    if (!request?.expenses) return 0;
    return request.expenses.reduce(
      (sum, expense) => sum + (parseFloat(expense.amount) || 0),
      0
    );
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" component="h2" fontWeight="500">
            Petty Cash Request Details
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
              Request Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Request ID</Typography>
                  <Typography sx={style.fieldValue}>
                    #{request?.id || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Status</Typography>
                  {getStatusChip(request?.status)}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>
                    Transaction Title
                  </Typography>
                  <Typography sx={style.fieldValue}>
                    {request?.transactionTitle || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Request Date</Typography>
                  <Typography sx={style.fieldValue}>
                    {request?.requestDate || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(0, 82, 155, 0.08)',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#00529B' }}>
                    Total Amount:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: '#00529B', fontWeight: 700 }}
                  >
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                    }).format(request?.totalAmount || calculateTotalAmount())}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Expenses Table */}
          {request?.expenses && request.expenses.length > 0 && (
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="#00529B"
                sx={{ mb: 2 }}
              >
                Expense Details ({request.expenses.length} items)
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead sx={style.tableHeader}>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Documents</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {request.expenses.map((expense, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(0, 82, 155, 0.02)',
                          },
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-RW', {
                            style: 'currency',
                            currency: 'RWF',
                          }).format(expense.amount || 0)}
                        </TableCell>
                        <TableCell>{expense.date || 'N/A'}</TableCell>
                        <TableCell>
                          {expense.documents && expense.documents.length > 0 ? (
                            <Box>
                              {expense.documents.map((doc, docIndex) => (
                                <Box
                                  key={docIndex}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 0.5,
                                  }}
                                >
                                  <AttachFileIcon
                                    sx={{
                                      mr: 0.5,
                                      color: '#00529B',
                                      fontSize: 16,
                                    }}
                                  />
                                  <Typography variant="caption">
                                    {doc.name || doc}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              No documents
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewPettyCashRequestModal;
