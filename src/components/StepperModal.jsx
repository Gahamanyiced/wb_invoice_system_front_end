import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Modal,
  Link,
  Button,
  Grid,
  Chip,
  Paper,
  Card,
  CardContent,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachmentIcon from '@mui/icons-material/Attachment';
import DescriptionIcon from '@mui/icons-material/Description';
import ApproveDialog from './ApproveDialog';

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
    justifyContent: 'space-between',
    gap: 2,
    bgcolor: 'white',
  },
  section: { p: 3, mb: 2, bgcolor: 'white' },
  fieldContainer: { mb: 2 },
  fieldLabel: { fontWeight: 600, color: '#666', fontSize: '0.875rem', mb: 0.5 },
  fieldValue: { color: '#333', fontSize: '0.95rem', fontWeight: 500 },
  glLineCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
  },
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
  actionButton: {
    borderRadius: '8px',
    fontWeight: 600,
    py: 1.5,
    flex: 1,
    bgcolor: '#4CAF50',
    '&:hover': { bgcolor: '#45a049' },
  },
};

// FIX: added 'to_sign' (underscore) as a recognised status colour
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'signed':
      return 'success';
    case 'pending':
    case 'to_sign': // ← FIXED (API value)
    case 'to sign': // ← kept for backward-compat with any legacy data
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
  return `${currency || ''} ${parseFloat(amount).toLocaleString()}`;
};

// ══ StepperModal wrapper ═════════════════════════════════════════════════════
function StepperModal({
  open,
  handleClose,
  isAllowed,
  selectedId,
  reloadFunction,
  invoice,
  isRollBack,
}) {
  const [index, setIndex] = useState();

  const handleApproveClick = (index) => setIndex(index);

  const handleDialogClose = () => {
    setIndex();
    handleClose();
    reloadFunction();
  };

  const handleGoBack = () => setIndex();

  return (
    <Modal
      open={open}
      onClose={handleDialogClose}
      aria-labelledby="stepper-modal-title"
    >
      {index ? (
        <ApproveDialog
          handleDialogClose={handleDialogClose}
          index={index - 1}
          handleGoBack={handleGoBack}
          selectedId={selectedId}
          isRollBack={isRollBack}
          invoice={invoice}
        />
      ) : (
        <Actions
          handleApproveClick={handleApproveClick}
          isAllowed={isAllowed}
          invoice={invoice}
          handleClose={handleDialogClose}
          open={open}
        />
      )}
    </Modal>
  );
}

// ══ Actions sub-component ════════════════════════════════════════════════════
const Actions = ({
  isAllowed,
  handleApproveClick,
  invoice,
  handleClose,
  open,
}) => {
  // ── COA data from DB ───────────────────────────────────────────────────────
  const { excelData, isLoading: coaLoading } = useCOAData({ enabled: open });

  // ── value helpers ──────────────────────────────────────────────────────────
  const getValue = (field) =>
    invoice?.invoice?.[field] || invoice?.[field] || 'N/A';

  const getDescriptiveValue = (field, value) => {
    if (!value || value === 'N/A') return 'N/A';
    switch (field) {
      case 'location': {
        const loc = excelData.locations.find((item) => item.value === value);
        return loc ? loc.label : value;
      }
      case 'aircraft_type': {
        const ac = excelData.aircraftTypes.find((item) => item.value === value);
        return ac ? ac.label : value;
      }
      case 'route': {
        const route = excelData.routes.find((item) => item.value === value);
        return route ? route.label : value;
      }
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

  const getGLCodeDescription = (glCode) => {
    if (!glCode || glCode === 'N/A') return 'N/A';
    const gl = excelData.glCodes.find((item) => item.value === glCode);
    return gl ? gl.label : glCode;
  };

  const getCostCenterDescription = (costCenter) => {
    if (!costCenter || costCenter === 'N/A') return 'N/A';
    const cc = excelData.costCenters.find((item) => item.value === costCenter);
    return cc ? cc.label : costCenter;
  };

  // Supports BOTH flat and nested structures
  const glLines = invoice?.invoice?.gl_lines || invoice?.gl_lines || [];
  const documents = invoice?.invoice?.documents || invoice?.documents || [];

  const invoiceOwner =
    invoice?.invoice?.invoice_owner || invoice?.invoice_owner;
  const ownerName = invoiceOwner
    ? `${invoiceOwner.firstname || ''} ${invoiceOwner.lastname || ''}`.trim()
    : 'N/A';

  return (
    <Box sx={style.modal}>
      {/* Header */}
      <Box sx={style.header}>
        <Typography variant="h6" component="h2" fontWeight="500">
          Invoice Review & Approval
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
        {/* ── Invoice Header ─────────────────────────────────────────────── */}
        <Paper elevation={0} sx={style.section}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" fontWeight="600" color="#00529B">
              Invoice #{getValue('invoice_number')}
            </Typography>
            <Chip
              label={getValue('status').toUpperCase()}
              color={getStatusColor(getValue('status'))}
              variant="outlined"
              size="medium"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Grid container spacing={3}>
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
                <Typography sx={style.fieldLabel}>Prepared By</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <PersonIcon fontSize="small" color="action" />
                  <Typography sx={style.fieldValue}>{ownerName}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Created At</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <CalendarTodayIcon fontSize="small" color="action" />
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

        {/* ── Supplier Information ───────────────────────────────────────── */}
        <Paper elevation={0} sx={style.section}>
          <Typography
            variant="subtitle1"
            fontWeight="600"
            color="#00529B"
            sx={{ mb: 3 }}
          >
            Supplier Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={style.fieldContainer}>
                <Typography sx={style.fieldLabel}>Supplier Number</Typography>
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
                          {coaLoading
                            ? 'Loading...'
                            : getGLCodeDescription(line.gl_code)}
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
                          {coaLoading
                            ? 'Loading...'
                            : getCostCenterDescription(line.cost_center)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Box sx={style.fieldContainer}>
                        <Typography sx={style.fieldLabel}>Amount</Typography>
                        <Typography sx={style.fieldValue} fontWeight="bold">
                          {formatCurrency(line.gl_amount, getValue('currency'))}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Row 2: Location | Aircraft Type | Route */}
                    <Grid item xs={12} md={4}>
                      <Box sx={style.fieldContainer}>
                        <Typography sx={style.fieldLabel}>Location</Typography>
                        <Typography sx={style.fieldValue}>
                          {coaLoading
                            ? 'Loading...'
                            : getDescriptiveValue('location', line.location)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={style.fieldContainer}>
                        <Typography sx={style.fieldLabel}>
                          Aircraft Type
                        </Typography>
                        <Typography sx={style.fieldValue}>
                          {coaLoading
                            ? 'Loading...'
                            : getDescriptiveValue(
                                'aircraft_type',
                                line.aircraft_type,
                              )}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={style.fieldContainer}>
                        <Typography sx={style.fieldLabel}>Route</Typography>
                        <Typography sx={style.fieldValue}>
                          {coaLoading
                            ? 'Loading...'
                            : getDescriptiveValue('route', line.route)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Paper>
        )}

        {/* ── Additional Details (Quantity) ──────────────────────────────── */}
        {getValue('quantity') !== 'N/A' && (
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Additional Details
            </Typography>
            <Grid container spacing={3}>
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
        )}

        {/* ── Documents ─────────────────────────────────────────────────── */}
        {documents.length > 0 && (
          <Paper elevation={0} sx={style.section}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AttachmentIcon sx={{ color: '#00529B' }} />
              <Typography variant="subtitle1" fontWeight="600" color="#00529B">
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

        {/* ── Legacy GL fields (backward compat, only when no gl_lines) ─── */}
        {!glLines.length && (
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Legacy GL Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>GL Code</Typography>
                  <Typography sx={style.fieldValue}>
                    {coaLoading
                      ? 'Loading...'
                      : getGLCodeDescription(getValue('gl_code'))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>GL Description</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('gl_description')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Cost Center</Typography>
                  <Typography sx={style.fieldValue}>
                    {coaLoading
                      ? 'Loading...'
                      : getCostCenterDescription(getValue('cost_center'))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Location</Typography>
                  <Typography sx={style.fieldValue}>
                    {coaLoading
                      ? 'Loading...'
                      : getDescriptiveValue('location', getValue('location'))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Aircraft Type</Typography>
                  <Typography sx={style.fieldValue}>
                    {coaLoading
                      ? 'Loading...'
                      : getDescriptiveValue(
                          'aircraft_type',
                          getValue('aircraft_type'),
                        )}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Route</Typography>
                  <Typography sx={style.fieldValue}>
                    {coaLoading
                      ? 'Loading...'
                      : getDescriptiveValue('route', getValue('route'))}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* ── Footer — action buttons ────────────────────────────────────────── */}
      {isAllowed && (
        <Box sx={style.footer}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="contained"
              sx={style.actionButton}
              onClick={() => handleApproveClick(1)}
              startIcon={<CheckCircleIcon />}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              sx={style.actionButton}
              onClick={() => handleApproveClick(2)}
              startIcon={<CancelIcon />}
            >
              Deny
            </Button>
            <Button
              variant="contained"
              sx={style.actionButton}
              onClick={() => handleApproveClick(3)}
              startIcon={<UndoIcon />}
            >
              Rollback
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default StepperModal;
