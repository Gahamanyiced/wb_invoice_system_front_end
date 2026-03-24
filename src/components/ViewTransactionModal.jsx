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
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
            : 'N/A'
        }
        size="small"
        sx={{
          ...(statusColors[status] || { bgcolor: '#9E9E9E', color: 'white' }),
          fontWeight: 500,
        }}
      />
    );
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount || 0));

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionChip = (actionType) => {
    const actionColors = {
      created: { bgcolor: '#66BB6A', label: 'Created' },
      updated: { bgcolor: '#42A5F5', label: 'Updated' },
      deleted: { bgcolor: '#EF5350', label: 'Deleted' },
      acknowledged: { bgcolor: '#9C27B0', label: 'Acknowledged' },
      rollback: { bgcolor: '#FF9800', label: 'Rollback' },
      replenished: { bgcolor: '#00897B', label: 'Replenished' },
    };
    const action = actionColors[actionType?.toLowerCase()] || {
      bgcolor: '#9E9E9E',
      label: actionType || 'Action',
    };
    return (
      <Chip
        icon={
          actionType === 'deleted' ? (
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
          ) : (
            <EditNoteIcon sx={{ fontSize: 14 }} />
          )
        }
        label={action.label}
        size="small"
        sx={{ bgcolor: action.bgcolor, color: 'white', fontWeight: 500 }}
      />
    );
  };

  if (!transaction) return null;

  const comments = issueComments?.results || issueComments?.comments || [];

  // Resolve documents — new shape: transaction.documents[]
  // Fallback to old single string for backward compat
  const documents =
    Array.isArray(transaction.documents) && transaction.documents.length > 0
      ? transaction.documents
      : transaction.supporting_document
        ? [
            {
              id: 0,
              document_url: transaction.supporting_document,
              document_name: transaction.supporting_document.split('/').pop(),
            },
          ]
        : [];

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" fontWeight={600}>
            Transaction Details
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
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

              {/* Replenishment Amount — only shown when present */}
              {transaction?.replenishment_amount && (
                <Grid item xs={12} sm={6}>
                  <Box sx={style.fieldContainer}>
                    <Typography sx={style.fieldLabel}>
                      Replenishment Amount
                    </Typography>
                    <Typography
                      sx={style.fieldValue}
                      fontWeight={700}
                      color="#00897B"
                    >
                      {formatAmount(transaction.replenishment_amount)}{' '}
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: '#666',
                        }}
                      >
                        {transaction?.currency}
                      </span>
                    </Typography>
                  </Box>
                </Grid>
              )}

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

          {/* Custodian Information */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#00529B"
              gutterBottom
            >
              Custodian Information
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
                    {transaction?.issued_by?.lastname ||
                      transaction?.issued_by?.name}
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
                bgcolor: 'rgba(102, 187, 106, 0.02)',
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#00529B"
                gutterBottom
              >
                Expense Creator
              </Typography>
              <Divider sx={{ mb: 2 }} />

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
              </Grid>
            </Paper>
          )}

          {/* Supporting Documents — updated: transaction.documents[] */}
          {documents.length > 0 && (
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#00529B"
                gutterBottom
              >
                Supporting Documents ({documents.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {documents.map((doc, i) => (
                <Box
                  key={doc.id ?? i}
                  onClick={() => window.open(doc.document_url, '_blank')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    mb: i < documents.length - 1 ? 1 : 0,
                    bgcolor: 'rgba(0, 82, 155, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(0, 82, 155, 0.15)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.1)' },
                  }}
                >
                  <AttachFileIcon
                    sx={{ mr: 1, color: '#00529B', flexShrink: 0 }}
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
                        `Document ${i + 1}`}
                    </Typography>
                    {doc.uploaded_by && (
                      <Typography variant="caption" color="text.secondary">
                        {doc.uploaded_by}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#00529B',
                      fontWeight: 500,
                      flexShrink: 0,
                      ml: 1,
                    }}
                  >
                    View Document
                  </Typography>
                </Box>
              ))}
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
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#00529B' }} />
                </Box>
              ) : comments.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 1 }}
                >
                  No comments yet.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {comments.map((c, i) => (
                    <Box
                      key={c.id || i}
                      sx={{
                        p: 1.5,
                        bgcolor: 'white',
                        borderRadius: 1,
                        border: '1px solid rgba(0, 82, 155, 0.08)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
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
