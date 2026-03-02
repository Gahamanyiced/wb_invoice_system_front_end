import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CommentIcon from '@mui/icons-material/Comment';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { getPettyCashIssueComments } from '../features/pettyCash/pettyCashSlice';

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
  const dispatch = useDispatch();
  const { issueComments, isLoading } = useSelector((state) => state.pettyCash);
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  useEffect(() => {
    if (open && transaction?.id) {
      dispatch(getPettyCashIssueComments(transaction.id));
    }
  }, [open, transaction?.id, dispatch]);

  const getStatusChip = (status) => {
    const statusColors = {
      active: { bgcolor: '#66BB6A', color: 'white' },
      exhausted: { bgcolor: '#EF5350', color: 'white' },
      pending: { bgcolor: '#FFA726', color: 'white' },
      pending_acknowledgment: { bgcolor: '#FF9800', color: 'white' },
    };

    return (
      <Chip
        label={
          status
            ? status
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            : 'N/A'
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  const getActionChip = (action_type) => {
    const map = {
      update: {
        bgcolor: '#1976D2',
        icon: <EditNoteIcon sx={{ fontSize: 13 }} />,
        label: 'Update',
      },
      delete: {
        bgcolor: '#EF5350',
        icon: <DeleteOutlineIcon sx={{ fontSize: 13 }} />,
        label: 'Delete',
      },
      create: { bgcolor: '#66BB6A', icon: null, label: 'Create' },
    };
    const cfg = map[action_type?.toLowerCase()] || {
      bgcolor: '#9E9E9E',
      icon: null,
      label: action_type || 'N/A',
    };
    return (
      <Chip
        icon={cfg.icon}
        label={cfg.label}
        size="small"
        sx={{
          bgcolor: cfg.bgcolor,
          color: 'white',
          fontWeight: 600,
          fontSize: '0.7rem',
        }}
      />
    );
  };

  const comments = issueComments?.results || [];

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
                  <Typography sx={style.fieldLabel}>Status</Typography>
                  {getStatusChip(transaction?.status)}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Currency</Typography>
                  <Chip
                    label={transaction?.currency || 'USD'}
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
                  <Typography sx={style.fieldLabel}>Amount Issued</Typography>
                  <Typography
                    sx={style.fieldValue}
                    fontWeight={700}
                    color="#00529B"
                  >
                    {formatAmount(transaction?.amount)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>
                    Remaining Amount
                  </Typography>
                  <Typography
                    sx={style.fieldValue}
                    fontWeight={700}
                    color="#00529B"
                  >
                    {formatAmount(transaction?.remaining_amount)}
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

              {/* Notes */}
              <Grid item xs={12}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Notes</Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      p: 1.5,
                      bgcolor: 'rgba(0, 82, 155, 0.03)',
                      borderRadius: 1,
                      border: '1px solid rgba(0, 82, 155, 0.08)',
                      maxHeight: 160,
                      overflowY: 'auto',
                    }}
                  >
                    <Typography
                      sx={{
                        ...style.fieldValue,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6,
                      }}
                    >
                      {transaction?.notes || 'No notes provided'}
                    </Typography>
                  </Box>
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

          {/* Expense Creator Information */}
          {transaction?.expense_creator && (
            <Paper
              elevation={0}
              sx={{
                ...style.section,
                bgcolor: 'rgba(102, 187, 106, 0.04)',
                border: '1px solid rgba(102, 187, 106, 0.2)',
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#57A05A"
                gutterBottom
              >
                Expense Creator (Verifier)
              </Typography>
              <Divider
                sx={{ mb: 2, borderColor: 'rgba(102, 187, 106, 0.3)' }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>Name</Typography>
                    <Typography sx={style.fieldValue}>
                      {transaction.expense_creator.firstname}{' '}
                      {transaction.expense_creator.lastname}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>Position</Typography>
                    <Typography sx={style.fieldValue}>
                      {transaction.expense_creator.position || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>Email</Typography>
                    <Typography sx={style.fieldValue}>
                      {transaction.expense_creator.email || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>Department</Typography>
                    <Typography sx={style.fieldValue}>
                      {transaction.expense_creator.department || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>Section</Typography>
                    <Typography sx={style.fieldValue}>
                      {transaction.expense_creator.section || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>Station</Typography>
                    <Typography sx={style.fieldValue}>
                      {transaction.expense_creator.station || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

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

          {/* Issue Comments */}
          <Accordion
            expanded={commentsExpanded}
            onChange={() => setCommentsExpanded((p) => !p)}
            elevation={0}
            sx={{
              border: '1px solid rgba(0, 82, 155, 0.12)',
              borderRadius: '8px !important',
              mb: 2,
              '&:before': { display: 'none' },
              bgcolor: 'rgba(0, 82, 155, 0.02)',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00529B' }} />}
              sx={{ borderRadius: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CommentIcon sx={{ color: '#00529B', fontSize: 20 }} />
                <Typography fontWeight={600} color="#00529B">
                  Issue Comments
                </Typography>
                <Chip
                  label={issueComments?.count ?? comments.length}
                  size="small"
                  sx={{
                    bgcolor: '#00529B',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0 }}>
              <Divider sx={{ mb: 2 }} />

              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} sx={{ color: '#00529B' }} />
                </Box>
              ) : comments.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 2 }}
                >
                  No comments yet.
                </Typography>
              ) : (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  {comments.map((c) => (
                    <Box
                      key={c.id}
                      sx={{
                        p: 1.75,
                        bgcolor: 'white',
                        borderRadius: 1.5,
                        border: '1px solid rgba(0, 82, 155, 0.1)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      {/* Top row: avatar + name + action chip + date */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: '#00529B',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {c.commented_by_name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ lineHeight: 1.2 }}
                            >
                              {c.commented_by_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ lineHeight: 1 }}
                            >
                              {c.commented_by_email}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getActionChip(c.action_type)}
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(c.created_at)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Comment content */}
                      <Typography
                        variant="body2"
                        sx={{
                          pl: 0.5,
                          color: '#444',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.55,
                        }}
                      >
                        {c.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewTransactionModal;
