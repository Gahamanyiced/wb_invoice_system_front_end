import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const ViewPettyCashRequestModal = ({ open, handleClose, request }) => {
  if (!request) return null;

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: {
        bgcolor: '#FFA726',
        icon: <PendingIcon sx={{ fontSize: 16 }} />,
      },
      approved: {
        bgcolor: '#66BB6A',
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
      },
      denied: {
        bgcolor: '#EF5350',
        icon: <CancelIcon sx={{ fontSize: 16 }} />,
      },
      verified: {
        bgcolor: '#42A5F5',
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        icon={config.icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        sx={{
          bgcolor: config.bgcolor,
          color: 'white',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      />
    );
  };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      {Icon && (
        <Icon
          sx={{
            mr: 1.5,
            color: '#00529B',
            fontSize: 20,
            mt: 0.2,
          }}
        />
      )}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#666',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'block',
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#00529B',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon />
          <Typography variant="h6" fontWeight={600}>
            Petty Cash Request Details
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Request ID, Status, Verified, and Signatures - REMOVED Approval Level */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            p: 2,
            bgcolor: 'rgba(0, 82, 155, 0.05)',
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Request ID
            </Typography>
            <Typography variant="h4" fontWeight={700} color="#00529B">
              #{request.id}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Status
              </Typography>
              {getStatusChip(request.status)}
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Verified
              </Typography>
              <Chip
                icon={
                  request.is_verified ? (
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <PendingIcon sx={{ fontSize: 16 }} />
                  )
                }
                label={request.is_verified ? 'Yes' : 'No'}
                sx={{
                  bgcolor: request.is_verified ? '#66BB6A' : '#FFA726',
                  color: 'white',
                  fontWeight: 600,
                  mt: 0.5,
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Signatures
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#00529B">
                {request.signature_count}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            {/* Requester Information */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #00529B',
                }}
              >
                <PersonIcon sx={{ mr: 1, color: '#00529B' }} />
                <Typography variant="h6" fontWeight={600} color="#00529B">
                  Requester Information
                </Typography>
              </Box>
              <InfoRow
                label="Full Name"
                value={`${request.requester?.firstname || ''} ${
                  request.requester?.lastname || ''
                }`}
              />
              <InfoRow
                label="Email"
                value={request.requester?.email || 'N/A'}
              />
              <InfoRow
                label="Position"
                value={request.requester?.position || 'N/A'}
              />
              <InfoRow
                label="Department"
                value={request.requester?.department || 'N/A'}
              />
              <InfoRow
                label="Section"
                value={request.requester?.section || 'N/A'}
              />
              <InfoRow
                label="Station"
                value={request.requester?.station || 'N/A'}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Verifier Information */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #00529B',
                }}
              >
                <VerifiedUserIcon sx={{ mr: 1, color: '#00529B' }} />
                <Typography variant="h6" fontWeight={600} color="#00529B">
                  Verifier Information
                </Typography>
              </Box>
              <InfoRow
                label="Full Name"
                value={`${request.verifier?.firstname || ''} ${
                  request.verifier?.lastname || ''
                }`}
              />
              <InfoRow label="Email" value={request.verifier?.email || 'N/A'} />
              <InfoRow
                label="Position"
                value={request.verifier?.position || 'N/A'}
              />
              <InfoRow
                label="Department"
                value={request.verifier?.department || 'N/A'}
              />
              <InfoRow
                label="Section"
                value={request.verifier?.section || 'N/A'}
              />
              {request.verification_notes && (
                <InfoRow
                  label="Verification Notes"
                  value={request.verification_notes}
                />
              )}
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            {/* Related Petty Cash Information */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #00529B',
                }}
              >
                <AccountBalanceWalletIcon sx={{ mr: 1, color: '#00529B' }} />
                <Typography variant="h6" fontWeight={600} color="#00529B">
                  Related Petty Cash
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(0, 82, 155, 0.03)',
                  borderRadius: 2,
                  border: '1px solid rgba(0, 82, 155, 0.2)',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="#00529B"
                  mb={1}
                >
                  PC-{request.related_petty_cash?.id || 'N/A'}
                </Typography>

                <InfoRow
                  label="Holder"
                  value={`${
                    request.related_petty_cash?.holder?.firstname || ''
                  } ${request.related_petty_cash?.holder?.lastname || ''}`}
                />
                <InfoRow
                  label="Issued By"
                  value={`${
                    request.related_petty_cash?.issued_by?.firstname || ''
                  } ${request.related_petty_cash?.issued_by?.lastname || ''}`}
                />
                <InfoRow
                  label="Issue Date"
                  value={
                    request.related_petty_cash?.issue_date
                      ? new Date(
                          request.related_petty_cash.issue_date
                        ).toLocaleDateString('en-GB')
                      : 'N/A'
                  }
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <InfoRow
                      label="Total Amount"
                      value={new Intl.NumberFormat('en-RW', {
                        style: 'currency',
                        currency: 'RWF',
                        minimumFractionDigits: 0,
                      }).format(
                        parseFloat(request.related_petty_cash?.amount || 0)
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow
                      label="Remaining"
                      value={new Intl.NumberFormat('en-RW', {
                        style: 'currency',
                        currency: 'RWF',
                        minimumFractionDigits: 0,
                      }).format(
                        parseFloat(
                          request.related_petty_cash?.remaining_amount || 0
                        )
                      )}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Status
                  </Typography>
                  <Chip
                    label={
                      request.related_petty_cash?.status
                        ?.charAt(0)
                        .toUpperCase() +
                        request.related_petty_cash?.status?.slice(1) || 'N/A'
                    }
                    size="small"
                    sx={{
                      bgcolor:
                        request.related_petty_cash?.status === 'active'
                          ? '#66BB6A'
                          : request.related_petty_cash?.status === 'exhausted'
                          ? '#EF5350'
                          : '#FFA726',
                      color: 'white',
                      fontWeight: 500,
                      mt: 0.5,
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
                        mt: 0.5,
                      }}
                    />
                  )}
                </Box>
                {request.related_petty_cash?.notes && (
                  <InfoRow
                    label="Notes"
                    value={request.related_petty_cash.notes}
                  />
                )}
                {request.related_petty_cash?.supporting_document && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Supporting Document
                    </Typography>
                    <Link
                      href={request.related_petty_cash.supporting_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#00529B',
                        textDecoration: 'none',
                        mt: 0.5,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <AttachFileIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      View Document
                    </Link>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Expenses List */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              pb: 1,
              borderBottom: '2px solid #00529B',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptLongIcon sx={{ mr: 1, color: '#00529B' }} />
              <Typography variant="h6" fontWeight={600} color="#00529B">
                Expenses ({request.expenses?.length || 0})
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Total Amount
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#00529B">
                {new Intl.NumberFormat('en-RW', {
                  style: 'currency',
                  currency: 'RWF',
                  minimumFractionDigits: 0,
                }).format(parseFloat(request.total_expenses || 0))}
              </Typography>
            </Box>
          </Box>

          {request.expenses && request.expenses.length > 0 ? (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: '1px solid #e0e0e0' }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#00529B' }}>
                      #
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#00529B' }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#00529B' }}>
                      Item Description
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: '#00529B' }}
                      align="right"
                    >
                      Amount (RWF)
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: '#00529B' }}
                      align="center"
                    >
                      Document
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {request.expenses.map((expense, index) => (
                    <TableRow key={expense.id || index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {expense.item_description}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="#00529B">
                          {new Intl.NumberFormat('en-RW', {
                            minimumFractionDigits: 0,
                          }).format(parseFloat(expense.amount || 0))}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {expense.supporting_document ? (
                          <Link
                            href={expense.supporting_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: '#00529B',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            <AttachFileIcon sx={{ fontSize: 18, mr: 0.5 }} />
                            View
                          </Link>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No document
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 1,
              }}
            >
              <Typography color="text.secondary">
                No expenses recorded
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Request Dates */}
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(0, 82, 155, 0.03)',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <CalendarTodayIcon
                  sx={{ color: '#00529B', fontSize: 30, mb: 1 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Created At
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(request.created_at).toLocaleString('en-GB')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(0, 82, 155, 0.03)',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <TrendingUpIcon
                  sx={{ color: '#00529B', fontSize: 30, mb: 1 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Last Updated
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(request.updated_at).toLocaleString('en-GB')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(0, 82, 155, 0.03)',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <ReceiptLongIcon
                  sx={{ color: '#00529B', fontSize: 30, mb: 1 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Row Number
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  #{request.row_number || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'rgba(0, 82, 155, 0.02)' }}>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            bgcolor: '#00529B',
            '&:hover': {
              bgcolor: '#003d73',
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

export default ViewPettyCashRequestModal;
