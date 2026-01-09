import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Divider,
  Chip,
  Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '80%', md: '70%', lg: '65%' },
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
  expenseCard: {
    border: '1px solid rgba(0, 82, 155, 0.2)',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
  },
};

const ViewPettyCashRequestModal = ({ open, handleClose, request }) => {
  if (!request) return null;

  const getStatusChip = (status) => {
    const statusColors = {
      pending: { bgcolor: '#FFA726', color: 'white' },
      approved: { bgcolor: '#66BB6A', color: 'white' },
      denied: { bgcolor: '#EF5350', color: 'white' },
      verified: { bgcolor: '#42A5F5', color: 'white' },
      'waiting to sign': { bgcolor: '#9C27B0', color: 'white' },
    };

    return (
      <Chip
        label={
          status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'
        }
        size="small"
        sx={{
          ...statusColors[status],
          fontWeight: 500,
          minWidth: '100px',
        }}
      />
    );
  };

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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="view-request-modal-title"
    >
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" fontWeight={600}>
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
          {/* Request Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Request Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Status</Typography>
                  {getStatusChip(request.status)}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Currency</Typography>
                  <Chip
                    label={request.currency || 'USD'}
                    size="small"
                    sx={{
                      bgcolor: '#00529B',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Total Expenses</Typography>
                  <Typography
                    sx={style.fieldValue}
                    fontWeight={700}
                    color="#00529B"
                  >
                    {formatAmount(request.total_expenses)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Created At</Typography>
                  <Typography sx={style.fieldValue}>
                    {formatDate(request.created_at)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Signature Count</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.signature_count || 0} signature(s)
                  </Typography>
                </Box>
              </Grid>

              {request.verification_notes && (
                <Grid item xs={12}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>
                      Verification Notes
                    </Typography>
                    <Typography sx={style.fieldValue}>
                      {request.verification_notes}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Requester Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Requester Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Name</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.requester?.firstname} {request.requester?.lastname}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Position</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.requester?.position || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Email</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.requester?.email || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Department</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.requester?.department || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Section</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.requester?.section || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Station</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.requester?.station || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Related Petty Cash Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Related Petty Cash Transaction
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Holder</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.related_petty_cash?.holder?.firstname}{' '}
                    {request.related_petty_cash?.holder?.lastname}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Issued By</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.related_petty_cash?.issued_by?.firstname}{' '}
                    {request.related_petty_cash?.issued_by?.lastname}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Issue Date</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.related_petty_cash?.issue_date
                      ? new Date(
                          request.related_petty_cash.issue_date
                        ).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Currency</Typography>
                  <Chip
                    label={request.related_petty_cash?.currency || 'USD'}
                    size="small"
                    sx={{
                      bgcolor: '#00529B',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Status</Typography>
                  <Chip
                    label={
                      request.related_petty_cash?.status
                        ? request.related_petty_cash.status
                            .charAt(0)
                            .toUpperCase() +
                          request.related_petty_cash.status.slice(1)
                        : 'N/A'
                    }
                    size="small"
                    sx={{
                      bgcolor:
                        request.related_petty_cash?.status === 'active'
                          ? '#66BB6A'
                          : '#EF5350',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                  {request.related_petty_cash?.is_acknowledged && (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                      label="Acknowledged"
                      size="small"
                      sx={{
                        bgcolor: '#42A5F5',
                        color: 'white',
                        fontWeight: 500,
                        ml: 1,
                      }}
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Total Amount</Typography>
                  <Typography sx={style.fieldValue} fontWeight={700}>
                    {formatAmount(request.related_petty_cash?.amount)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>
                    Remaining Amount
                  </Typography>
                  <Typography sx={style.fieldValue} fontWeight={700}>
                    {formatAmount(request.related_petty_cash?.remaining_amount)}
                  </Typography>
                </Box>
              </Grid>

              {request.related_petty_cash?.notes && (
                <Grid item xs={12}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>Notes</Typography>
                    <Typography sx={style.fieldValue}>
                      {request.related_petty_cash.notes}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {request.related_petty_cash?.acknowledgment_notes && (
                <Grid item xs={12}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>
                      Acknowledgment Notes
                    </Typography>
                    <Typography sx={style.fieldValue}>
                      {request.related_petty_cash.acknowledgment_notes}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {request.related_petty_cash?.acknowledged_at && (
                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>
                      Acknowledged At
                    </Typography>
                    <Typography sx={style.fieldValue}>
                      {formatDate(request.related_petty_cash.acknowledged_at)}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {request.related_petty_cash?.supporting_document && (
                <Grid item xs={12}>
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
                      window.open(
                        request.related_petty_cash.supporting_document,
                        '_blank'
                      )
                    }
                  >
                    <AttachFileIcon sx={{ mr: 1, color: '#00529B' }} />
                    <Typography sx={{ flex: 1 }}>
                      Supporting Document
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#00529B', fontWeight: 500 }}
                    >
                      View Document
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Verifier Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Verifier Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Name</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.verifier?.firstname} {request.verifier?.lastname}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Position</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.verifier?.position || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Email</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.verifier?.email || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Department</Typography>
                  <Typography sx={style.fieldValue}>
                    {request.verifier?.department || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Verified</Typography>
                  <Chip
                    label={request.is_verified ? 'Yes' : 'No'}
                    size="small"
                    sx={{
                      bgcolor: request.is_verified ? '#66BB6A' : '#FFA726',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Expenses List */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Expenses ({request.expenses?.length || 0})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {request.expenses && request.expenses.length > 0 ? (
              request.expenses.map((expense, index) => (
                <Box key={expense.id || index} sx={style.expenseCard}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Expense #{index + 1}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={expense.currency || request.currency || 'USD'}
                        size="small"
                        sx={{
                          bgcolor: '#00529B',
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                      <Typography variant="h6" fontWeight={700} color="#00529B">
                        {formatAmount(expense.amount)}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={style.fieldContainer}>
                        <Typography sx={style.fieldLabel}>Date</Typography>
                        <Typography sx={style.fieldValue}>
                          {expense.date
                            ? new Date(expense.date).toLocaleDateString()
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={style.fieldContainer}>
                        <Typography sx={style.fieldLabel}>
                          Description
                        </Typography>
                        <Typography sx={style.fieldValue}>
                          {expense.item_description || 'No description'}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={style.fieldContainer}>
                        <Typography sx={style.fieldLabel}>
                          Supporting Document
                        </Typography>
                        {expense.supporting_document ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1.5,
                              bgcolor: 'rgba(0, 82, 155, 0.05)',
                              borderRadius: 1,
                              cursor: 'pointer',
                              mt: 0.5,
                              '&:hover': {
                                bgcolor: 'rgba(0, 82, 155, 0.1)',
                              },
                            }}
                            onClick={() =>
                              window.open(expense.supporting_document, '_blank')
                            }
                          >
                            <AttachFileIcon
                              sx={{ mr: 1, color: '#00529B', fontSize: 18 }}
                            />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {expense.supporting_document.split('/').pop()}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: '#00529B', fontWeight: 500 }}
                            >
                              View
                            </Typography>
                          </Box>
                        ) : (
                          <Typography
                            sx={style.fieldValue}
                            color="text.secondary"
                          >
                            No document attached
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">
                No expenses recorded
              </Typography>
            )}

            {/* Total Summary */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'rgba(0, 82, 155, 0.08)',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Total Expenses ({request.currency || 'USD'}):
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#00529B">
                {formatAmount(request.total_expenses)}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewPettyCashRequestModal;
