import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  StepLabel,
  Grid,
  Modal,
  Paper,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import StepperModal from '../components/StepperModal';
import Comment from '../components/Comment';
import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepIndicator from '@mui/joy/StepIndicator';
import { useDispatch, useSelector } from 'react-redux';
import {
  trackInvoiceById,
  verifySignature,
} from '../features/invoice/invoiceSlice';
import DownloadIcon from '@mui/icons-material/Download';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedIcon from '@mui/icons-material/Verified';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { getInvoiceReport } from '../features/report/reportSlice';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import ChainOverrideDialog from '../components/ChainOverrideDialog';

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
    width: 1000,
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
  stepperContainer: { p: 3, bgcolor: 'white', borderRadius: '8px', mb: 2 },
  qrCodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    p: 2,
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    bgcolor: 'rgba(0, 82, 155, 0.02)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: 'rgba(0, 82, 155, 0.05)',
      borderColor: '#00529B',
    },
    mt: 1,
  },
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'signed':
      return 'success';
    case 'pending':
    case 'to_sign':
    case 'to sign':
      return 'warning';
    case 'denied':
      return 'error';
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

function InvoiceTracking({ openModal, handleCloseModal, selected }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { invoiceReport } = useSelector((state) => state.report);

  const [stepperOpen, setStepperOpen] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [invoice, setInvoice] = useState();
  const [isAllowed, setIsAllowed] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [selectedId] = useState(selected?.invoice?.id || selected?.id);
  const [chainOpen, setChainOpen] = useState(false);

  // Visible to: admin  OR  (signer_admin AND is_invoice_verifier === true)
  const canManageChain =
    user?.role === 'admin' ||
    (user?.role === 'signer_admin' && user?.is_invoice_verifier === true);

  // ── COA data from DB ──────────────────────────────────────────────────────
  const { excelData, isLoading: coaLoading } = useCOAData({
    enabled: openModal,
  });

  // ── value helpers ─────────────────────────────────────────────────────────
  const getValue = (field) =>
    invoice?.invoice?.[field] || invoice?.[field] || 'N/A';

  const getInvoiceId = () => invoice?.invoice?.id || invoice?.id;

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

  // Supports BOTH flat and nested structures
  const glLines = invoice?.invoice?.gl_lines || invoice?.gl_lines || [];
  const invoiceOwner =
    invoice?.invoice?.invoice_owner || invoice?.invoice_owner;
  const ownerName = invoiceOwner
    ? `${invoiceOwner.firstname || ''} ${invoiceOwner.lastname || ''}`.trim()
    : 'N/A';
  const isRollBack = invoice?.invoice?.is_roll_back || invoice?.is_roll_back;

  // ── FIX: use 'to_sign' (underscore) to match API response ────────────────
  const handleStepClick = (invoiceItem) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Determine if the logged-in user is allowed to act on this invoice.
    // FIX: API returns 'to_sign' with underscore, not 'to sign' with space.
    const myHistoryEntry = invoice?.invoice_histories?.find(
      (item) => item?.signer?.email === currentUser?.email,
    );
    const allowed =
      (currentUser?.role === 'signer' ||
        currentUser?.role === 'signer_admin') &&
      myHistoryEntry?.status === 'to_sign'; // ← FIXED

    setIsAllowed(allowed);

    // Open the stepper for any actionable step, or when the step belongs to
    // the current user. isAllowed gates the action buttons inside StepperModal.
    if (
      invoiceItem?.status === 'to_sign' || // ← FIXED
      invoiceItem?.signer?.email === currentUser?.email
    ) {
      setStepperOpen(true);
    }
  };

  const handleStepperClose = () => {
    setStepperOpen(false);
    setShowActions(false);
    setIsAllowed(false);
  };

  const getInvoiceTrackingData = async () => {
    try {
      const res = await dispatch(trackInvoiceById(selectedId));
      const fetchedInvoice = res.payload;

      const hasSignedCEO = fetchedInvoice.invoice_histories.some(
        (item) => item.status === 'signed' && item.signer.position === 'CEO',
      );
      const hasSignedDCEO = fetchedInvoice.invoice_histories.some(
        (item) => item.status === 'signed' && item.signer.position === 'DCEO',
      );

      const processedInvoice = {
        ...fetchedInvoice,
        invoice_histories: (() => {
          if (hasSignedCEO) {
            return fetchedInvoice.invoice_histories.filter(
              (item) =>
                item?.signer?.email !== process.env.REACT_APP_CEO_OFFICE_EMAIL,
            );
          }
          if (hasSignedDCEO) {
            return fetchedInvoice.invoice_histories.filter(
              (item) =>
                item?.signer?.email !== process.env.REACT_APP_DCEO_OFFICE_EMAIL,
            );
          }
          return fetchedInvoice.invoice_histories;
        })(),
      };
      setInvoice(processedInvoice);
    } catch (error) {
      console.error('Error fetching invoice tracking data:', error);
      toast.error('Failed to load invoice tracking data.');
    }
  };

  useEffect(() => {
    getInvoiceTrackingData();
  }, [dispatch, selected.id]);

  useEffect(() => {
    if (invoiceReport && buttonClicked) {
      const blob = new Blob([invoiceReport], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }, [invoiceReport]);

  const handleDownloadInvoice = async (e, inv) => {
    e.preventDefault();
    setButtonClicked(true);
    try {
      navigate('/download-pdf', { state: { invoice: inv } });
    } catch (error) {
      console.error('Error navigating to download PDF:', error);
    }
  };

  const handleVerifySignature = async (invoiceItem) => {
    try {
      const public_key = invoiceItem?.public_key
        ?.replace('-----BEGIN PUBLIC KEY-----\n', '')
        ?.replace('\n-----END PUBLIC KEY-----', '')
        ?.replace(/\n/g, '');
      const data = {
        signature: invoiceItem?.signature,
        invoice_id: invoiceItem?.invoice,
        public_key,
      };
      const result = await dispatch(verifySignature(data));
      if (result.payload.valid === true) toast.success(result.payload.message);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="invoice-tracking-modal-title"
    >
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" component="h2" fontWeight="500">
            Invoice Tracking & Approval
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseModal}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={style.content}>
          {(invoice?.invoice || invoice) && (
            <>
              {/* ── Invoice Header ───────────────────────────────────────── */}
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
                      <Typography sx={style.fieldLabel}>
                        Invoice Date
                      </Typography>
                      <Typography sx={style.fieldValue}>
                        {getValue('invoice_date') !== 'N/A'
                          ? new Date(
                              getValue('invoice_date'),
                            ).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={style.fieldContainer}>
                      <Typography sx={style.fieldLabel}>
                        Service Period
                      </Typography>
                      <Typography sx={style.fieldValue}>
                        {getValue('service_period')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={style.fieldContainer}>
                      <Typography sx={style.fieldLabel}>
                        Total Amount
                      </Typography>
                      <Typography
                        sx={style.fieldValue}
                        fontWeight="bold"
                        color="#00529B"
                      >
                        {formatCurrency(
                          getValue('amount'),
                          getValue('currency'),
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={style.fieldContainer}>
                      <Typography sx={style.fieldLabel}>Created By</Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <PersonIcon fontSize="small" color="action" />
                        <Typography sx={style.fieldValue}>
                          {ownerName}
                        </Typography>
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

              {/* ── Supplier Information ─────────────────────────────────── */}
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
                      <Typography sx={style.fieldLabel}>
                        Supplier Number
                      </Typography>
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
                      <Typography sx={style.fieldLabel}>
                        Supplier Name
                      </Typography>
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
                      <Typography sx={style.fieldLabel}>
                        Payment Terms
                      </Typography>
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

              {/* ── GL Lines ─────────────────────────────────────────────── */}
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
                              <Typography sx={style.fieldLabel}>
                                GL Code
                              </Typography>
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
                              <Typography sx={style.fieldLabel}>
                                Amount
                              </Typography>
                              <Typography
                                sx={style.fieldValue}
                                fontWeight="bold"
                              >
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
                              <Typography sx={style.fieldLabel}>
                                Route
                              </Typography>
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

              {/* ── Additional Details (Quantity) ────────────────────────── */}
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

              {/* ── Approval Workflow Stepper ────────────────────────────── */}
              <Paper elevation={0} sx={style.stepperContainer}>
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  color="#00529B"
                  sx={{ mb: 3 }}
                >
                  Approval Workflow
                </Typography>

                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{ width: '100%', '--StepIndicator-size': '48px' }}
                >
                  {invoice?.invoice_histories?.map((invoiceItem, index) => (
                    <Step
                      key={index}
                      onClick={() => handleStepClick(invoiceItem)}
                      orientation="vertical"
                      indicator={
                        <StepIndicator
                          variant="solid"
                          color={
                            invoiceItem?.status === 'signed'
                              ? 'success'
                              : invoiceItem?.status === 'pending'
                                ? 'neutral'
                                : invoiceItem?.status === 'denied'
                                  ? 'warning'
                                  : 'primary'
                          }
                          sx={{ cursor: 'pointer' }}
                        >
                          {invoiceItem?.status === 'signed' ? (
                            <VerifiedIcon fontSize="small" />
                          ) : (
                            index + 1
                          )}
                        </StepIndicator>
                      }
                    >
                      <StepLabel sx={{ textAlign: 'center' }}>
                        <Box sx={{ minWidth: '200px' }}>
                          <Typography variant="body2" fontWeight="500">
                            {invoiceItem?.status === 'pending'
                              ? 'To be signed by: '
                              : invoiceItem?.status === 'to_sign' // ← FIXED
                                ? 'Next to sign: '
                                : invoiceItem?.status === 'denied'
                                  ? 'Denied by: '
                                  : 'Signed by: '}
                            {`${invoiceItem?.signer?.firstname} ${invoiceItem?.signer?.lastname}`}
                          </Typography>

                          <Chip
                            size="small"
                            label={invoiceItem?.status.toUpperCase()}
                            color={getStatusColor(invoiceItem?.status)}
                            sx={{ mt: 1, mb: 1 }}
                          />

                          {invoiceItem?.signer?.position && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              Position: {invoiceItem.signer.position}
                            </Typography>
                          )}

                          {invoiceItem?.is_delegated &&
                            invoiceItem?.original_signer && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                Delegated from:{' '}
                                {invoiceItem.original_signer.name}
                              </Typography>
                            )}

                          {invoiceItem?.status === 'signed' && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="success.main"
                            >
                              Signed on:{' '}
                              {invoiceItem?.updated_at &&
                                new Date(
                                  invoiceItem?.updated_at,
                                ).toLocaleString()}
                            </Typography>
                          )}

                          {invoiceItem?.status === 'signed' &&
                            invoiceItem?.signature && (
                              <Box sx={style.qrCodeContainer}>
                                <Tooltip title="Click to verify signature">
                                  <Box
                                    onClick={() =>
                                      handleVerifySignature(invoiceItem)
                                    }
                                    sx={{ textAlign: 'center' }}
                                  >
                                    <QrCodeIcon
                                      sx={{ color: '#00529B', mb: 1 }}
                                    />
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      mb={1}
                                    >
                                      Digital Signature
                                    </Typography>
                                    <QRCodeSVG
                                      size={80}
                                      value={
                                        invoiceItem?.signature
                                          ? `${process.env.REACT_APP_URL}/verify-signature/${getInvoiceId()}/${encodeURIComponent(
                                              invoiceItem?.public_key
                                                ?.replace(
                                                  '-----BEGIN PUBLIC KEY-----\n',
                                                  '',
                                                )
                                                ?.replace(
                                                  '\n-----END PUBLIC KEY-----',
                                                  '',
                                                )
                                                ?.replace(/\n/g, ''),
                                            )}/${encodeURIComponent(
                                              invoiceItem?.signature,
                                            )}`
                                          : ''
                                      }
                                    />
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      mt={1}
                                      color="primary"
                                    >
                                      Click to verify
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </Box>
                            )}
                        </Box>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
            </>
          )}
        </Box>

        {/* Footer */}
        <Box sx={style.footer}>
          <Comment selected={selectedId} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            {canManageChain && invoice && (
              <Button
                variant="outlined"
                onClick={() => setChainOpen(true)}
                startIcon={<ManageAccountsIcon />}
                sx={{
                  borderColor: '#00529B',
                  color: '#00529B',
                  '&:hover': { bgcolor: 'rgba(0,82,155,0.05)' },
                  borderRadius: '8px',
                }}
              >
                Manage Chain
              </Button>
            )}
            <Button
              variant="contained"
              onClick={(event) => handleDownloadInvoice(event, invoice)}
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: '#00529B',
                '&:hover': { bgcolor: '#003a6d' },
                borderRadius: '8px',
              }}
            >
              Download Invoice
            </Button>
          </Box>
        </Box>

        {/* Chain Override Dialog */}
        {chainOpen && (
          <ChainOverrideDialog
            open={chainOpen}
            onClose={() => setChainOpen(false)}
            invoice={invoice}
            onSuccess={() => {
              setChainOpen(false);
              getInvoiceTrackingData();
            }}
          />
        )}

        {stepperOpen && (
          <StepperModal
            isAllowed={isAllowed}
            open={stepperOpen}
            handleClose={handleStepperClose}
            selectedId={selected?.invoice?.id || selected?.id}
            reloadFunction={getInvoiceTrackingData}
            invoice={invoice}
            isRollBack={isRollBack}
          />
        )}
      </Box>
    </Modal>
  );
}

export default InvoiceTracking;
