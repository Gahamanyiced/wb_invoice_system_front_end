import { formatCurrencyAmount as _fca } from '../utils/formatAmount';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Modal,
  Button,
  Paper,
  Grid,
  IconButton,
  Divider,
  Chip,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachmentIcon from '@mui/icons-material/Attachment';

// ── COA data from DB instead of Excel file ────────────────────────────────────
import useCOAData from '../hooks/useCOAData';

// Payment terms — kept for getDescriptiveValue lookup (no API equivalent)
const paymentTermsOptions = [
  { value: 'net_30', label: 'Net 30 - Payment due within 30 days' },
  { value: 'net_45', label: 'Net 45 - Payment due within 45 days' },
  { value: 'net_60', label: 'Net 60 - Payment due within 60 days' },
  { value: 'net_90', label: 'Net 90 - Payment due within 90 days' },
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'end_of_month', label: 'End of Month' },
  { value: '15_mfg', label: '15 MFG - 15th of month following goods receipt' },
  {
    value: '15_mfi',
    label: '15 MFI - 15th of month following invoice receipt',
  },
  { value: 'custom', label: 'Custom - Enter your own terms' },
];

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900,
    maxWidth: '95vw',
    bgcolor: '#f5f5f5',
    borderRadius: '12px',
    boxShadow: 24,
    p: 0,
    overflow: 'hidden',
    maxHeight: '90vh',
  },
  header: {
    bgcolor: '#00529B',
    color: 'white',
    py: 2,
    px: 3,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    p: 0,
    overflowY: 'auto',
    maxHeight: 'calc(90vh - 130px)',
  },
  footer: {
    p: 2,
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    bgcolor: 'white',
  },
  section: { p: 3, mb: 2, bgcolor: 'white' },
  fieldContainer: { mb: 2 },
  fieldLabel: { fontWeight: 600, color: '#666', fontSize: '0.875rem', mb: 0.5 },
  fieldValue: { color: '#333', fontSize: '0.95rem', fontWeight: 500 },
  documentCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  glLineCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
  },
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'signed':
      return 'success';
    case 'pending':
    case 'to sign':
      return 'warning';
    case 'denied':
      return 'error';
    case 'rollback':
      return 'warning';
    case 'draft':
      return 'default';
    default:
      return 'primary';
  }
};

const formatCurrency = (amount, currency) => {
  if (!amount) return 'N/A';
  return _fca(amount, currency);
};

function ViewInvoiceModal({ defaultValues, open, handleClose }) {
  const { excelData, isLoading: coaLoading } = useCOAData({ enabled: open });

  // ── value helpers ──────────────────────────────────────────────────────────
  const getValue = (field) => defaultValues?.[field] || 'N/A';

  // getDescriptiveValue: only used for supplier_number and payment_terms
  // (those fields have no _detail equivalents in the API response)
  const getDescriptiveValue = (field, value) => {
    if (!value || value === 'N/A') return 'N/A';
    switch (field) {
      case 'payment_terms': {
        const pt = paymentTermsOptions.find((option) => option.value === value);
        return pt ? pt.label : value;
      }
      case 'supplier_number': {
        const supplier = excelData.suppliers.find(
          (item) => item.value === value,
        );
        return supplier ? supplier.label : value;
      }
      default:
        return value;
    }
  };

  // ── GL line _detail resolvers ─────────────────────────────────────────────
  // API now returns _detail nested objects alongside raw IDs.
  // Always prefer _detail; fall back to raw value if detail is absent.

  const resolveGLCode = (line) => {
    if (line?.gl_account_detail)
      return `${line.gl_account_detail.gl_code} - ${line.gl_account_detail.gl_description}`;
    return line?.gl_description || 'N/A';
  };

  const resolveCostCenter = (line) => {
    if (line?.cost_center_detail)
      return `${line.cost_center_detail.cc_code} - ${line.cost_center_detail.cc_description}`;
    return line?.cost_center ? String(line.cost_center) : 'N/A';
  };

  const resolveLocation = (line) => {
    if (line?.location_detail)
      return `${line.location_detail.loc_code} - ${line.location_detail.loc_name}`;
    return line?.location ? String(line.location) : 'N/A';
  };

  const resolveAircraftType = (line) => {
    if (line?.aircraft_type_detail)
      return `${line.aircraft_type_detail.code} - ${line.aircraft_type_detail.description}`;
    return line?.aircraft_type ? String(line.aircraft_type) : 'N/A';
  };

  const resolveRoute = (line) => {
    if (line?.route_detail)
      return `${line.route_detail.code} - ${line.route_detail.description}`;
    return line?.route ? String(line.route) : 'N/A';
  };

  // ── data ───────────────────────────────────────────────────────────────────
  const glLines = defaultValues?.gl_lines || [];
  const documents = defaultValues?.documents || [];

  const invoiceOwner = defaultValues?.invoice_owner;
  const ownerName = invoiceOwner
    ? `${invoiceOwner.firstname || ''} ${invoiceOwner.lastname || ''}`.trim()
    : 'N/A';

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="view-invoice-modal-title"
    >
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" component="h2" fontWeight="500">
            Invoice Details
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

        <Box sx={style.content}>
          {/* ── Basic Information ──────────────────────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Invoice Number</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('invoice_number')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Reference</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('reference')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Invoice Date</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('invoice_date') !== 'N/A'
                      ? new Date(getValue('invoice_date')).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Service Period</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('service_period')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Status</Typography>
                  <Chip
                    label={(getValue('status') || 'N/A').toUpperCase()}
                    color={getStatusColor(getValue('status'))}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Created By</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: '#00529B', fontSize: 18 }} />
                    <Typography sx={style.fieldValue}>{ownerName}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Created At</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon
                      sx={{ color: '#00529B', fontSize: 16 }}
                    />
                    <Typography sx={style.fieldValue}>
                      {getValue('created_at') !== 'N/A'
                        ? new Date(getValue('created_at')).toLocaleString()
                        : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* ── Supplier & Financial Information ───────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Supplier & Financial Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Supplier</Typography>
                  <Typography sx={style.fieldValue}>
                    {coaLoading
                      ? 'Loading...'
                      : getDescriptiveValue(
                          'supplier_number',
                          getValue('supplier_number'),
                        )}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Supplier Name</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('supplier_name')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Currency</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('currency')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Total Amount</Typography>
                  <Typography
                    sx={style.fieldValue}
                    fontWeight="bold"
                    color="#00529B"
                  >
                    {formatCurrency(getValue('amount'), getValue('currency'))}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Quantity</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('quantity')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* ── GL Lines ───────────────────────────────────────────────────── */}
          {glLines.length > 0 && (
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="#00529B"
                sx={{ mb: 3 }}
              >
                GL Lines ({glLines.length})
              </Typography>

              {glLines.map((line, index) => (
                <Card key={index} sx={style.glLineCard}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="500"
                      sx={{ mb: 2 }}
                    >
                      GL Line {index + 1}
                    </Typography>

                    <Grid container spacing={2}>
                      {/* Row 1: GL Code | GL Description | Cost Center | Amount */}
                      <Grid item xs={12} md={3}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>GL Code</Typography>
                          <Typography sx={style.fieldValue}>
                            {resolveGLCode(line)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>
                            GL Description
                          </Typography>
                          <Typography sx={style.fieldValue}>
                            {line.gl_description || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>
                            Cost Center
                          </Typography>
                          <Typography sx={style.fieldValue}>
                            {resolveCostCenter(line)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={2}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>Amount</Typography>
                          <Typography sx={style.fieldValue} fontWeight="bold">
                            {formatCurrency(
                              line.gl_amount,
                              getValue('currency'),
                            )}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Row 2: Location | Aircraft Type | Route */}
                      <Grid item xs={12} md={4}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>
                            Location
                          </Typography>
                          <Typography sx={style.fieldValue}>
                            {resolveLocation(line)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>
                            Aircraft Type
                          </Typography>
                          <Typography sx={style.fieldValue}>
                            {resolveAircraftType(line)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>Route</Typography>
                          <Typography sx={style.fieldValue}>
                            {resolveRoute(line)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}

          {/* ── Payment Information ────────────────────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Payment Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Payment Terms</Typography>
                  <Typography sx={style.fieldValue}>
                    {coaLoading
                      ? 'Loading...'
                      : getDescriptiveValue(
                          'payment_terms',
                          getValue('payment_terms'),
                        )}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>
                    Payment Due Date
                  </Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('payment_due_date') !== 'N/A'
                      ? new Date(
                          getValue('payment_due_date'),
                        ).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* ── Documents ─────────────────────────────────────────────────── */}
          {documents.length > 0 && (
            <Paper elevation={0} sx={style.section}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
              >
                <AttachmentIcon sx={{ color: '#00529B' }} />
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  color="#00529B"
                >
                  Documents ({documents.length})
                </Typography>
              </Box>

              <Stack spacing={2}>
                {documents.map((doc, index) => (
                  <Card key={index} sx={style.documentCard}>
                    <DescriptionIcon sx={{ color: '#00529B' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="500">
                        Document {index + 1}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.filename ||
                          doc.name ||
                          `Invoice_Document_${index + 1}`}
                      </Typography>
                    </Box>
                    {doc.file_data && (
                      <Button
                        variant="outlined"
                        size="small"
                        component="a"
                        href={doc.file_data}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: '#00529B',
                          borderColor: '#00529B',
                          '&:hover': { bgcolor: 'rgba(0, 82, 155, 0.05)' },
                          borderRadius: '8px',
                        }}
                      >
                        View Document
                      </Button>
                    )}
                  </Card>
                ))}
              </Stack>
            </Paper>
          )}
        </Box>

        {/* Footer */}
        <Box sx={style.footer}>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: '#00529B',
              '&:hover': { bgcolor: '#003a6d' },
              borderRadius: '8px',
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ViewInvoiceModal;
