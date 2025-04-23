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
  CardHeader,
  Chip,
  IconButton,
  Container
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
import { getInvoiceReport } from '../features/report/reportSlice';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import { Close } from '@mui/icons-material';

const styles = {
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    padding: 0,
    width: '90%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
  },
  header: {
    padding: '16px 24px',
    backgroundColor: '#00529B',
    color: 'white',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  content: {
    padding: '24px',
  },
  infoSection: {
    marginBottom: '24px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: '#666',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '4px',
  },
  value: {
    fontSize: '1rem',
    fontWeight: 400,
  },
  stepper: {
    marginTop: '32px',
    width: '100%',
    '--StepIndicator-size': '48px',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '24px',
    padding: '16px 0',
    borderTop: '1px solid #eee',
  },
  statusChip: {
    fontWeight: 'bold',
  },
  qrCode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '8px 0',
  }
};

function InvoiceTracking({ openModal, handleCloseModal, selected }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { invoiceReport } = useSelector((state) => state.report);
  const [open, setOpen] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [invoice, setInvoice] = useState();
  const [isAllowed, setIsAllowed] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [selectedId, setSelectedId] = useState(
    selected?.invoice?.id || selected?.id
  );

  const handleStepClick = (status) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const signer = invoice?.invoice_histories?.find((item) => {
      return item?.signer?.email === user?.email;
    });

    if (
      (user?.role === 'signer' || user?.role === 'signer_admin') &&
      signer?.status === 'to sign'
    ) {
      setIsAllowed(true);
    }
    if (status === 'to sign') {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setShowActions(false);
    setIsAllowed(false);
  };

  const getInvoiceTrackingData = async () => {
    try {
      const res = await dispatch(trackInvoiceById(selectedId));
      const fetchedInvoice = res.payload;

      // Check if any invoiceItem has status 'signed' and signer.position 'CEO' or 'DCEO'
      const hasSignedCEO = fetchedInvoice.invoice_histories.some(
        (item) => item.status === 'signed' && item.signer.position === 'CEO'
      );

      const hasSignedDCEO = fetchedInvoice.invoice_histories.some(
        (item) => item.status === 'signed' && item.signer.position === 'DCEO'
      );

      // Create a new object with filtered invoice_histories
      const processedInvoice = {
        ...fetchedInvoice,
        invoice_histories: (() => {
          if (hasSignedCEO) {
            return fetchedInvoice.invoice_histories.filter(
              (item) =>
                item?.signer?.email !== process.env.REACT_APP_CEO_OFFICE_EMAIL
            );
          }
          if (hasSignedDCEO) {
            return fetchedInvoice.invoice_histories.filter(
              (item) =>
                item?.signer?.email !== process.env.REACT_APP_DCEO_OFFICE_EMAIL
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

  const handleDownloadInvoice = async (e, invoice) => {
    e.preventDefault();
    setButtonClicked(true);

    try {
      navigate('/download-pdf', { state: { invoice } });
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
      if (result.payload.valid === true) {
        toast.success(result.payload.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'default';
      case 'to sign': return 'primary';
      case 'signed': return 'success';
      case 'denied': return 'error';
      default: return 'default';
    }
  };

  return (
    <Modal
      sx={styles.modal}
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="invoice-tracking-modal"
    >
      <Paper sx={styles.paper}>
        <Box sx={styles.header}>
          <Typography variant="h6">
            Invoice Details
          </Typography>
          <IconButton color="inherit" onClick={handleCloseModal} size="small">
            <Close />
          </IconButton>
        </Box>
        
        <Box sx={styles.content}>
          {invoice?.invoice && (
            <>
              <Box sx={styles.infoSection}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" fontWeight="500">
                    Invoice #{invoice.invoice.invoice_number}
                  </Typography>
                  <Chip 
                    label={invoice.invoice.status.toUpperCase()}
                    color={getStatusColor(invoice.invoice.status)}
                    sx={styles.statusChip}
                  />
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader 
                    title="Supplier Information" 
                    sx={{ backgroundColor: '#f5f5f5', py: 1 }}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>Supplier Number</Typography>
                          <Typography sx={styles.value}>{invoice.invoice.supplier_number || '-'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>Supplier Name</Typography>
                          <Typography sx={styles.value}>{invoice.invoice.supplier_name || '-'}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader 
                    title="Invoice Details" 
                    sx={{ backgroundColor: '#f5f5f5', py: 1 }}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>Service Period</Typography>
                          <Typography sx={styles.value}>{invoice.invoice.service_period || '-'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>GL Code</Typography>
                          <Typography sx={styles.value}>{invoice.invoice.gl_code || '-'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>GL Description</Typography>
                          <Typography sx={styles.value}>{invoice.invoice.gl_description || '-'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>Location</Typography>
                          <Typography sx={styles.value}>{invoice.invoice.location || '-'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>Cost Center</Typography>
                          <Typography sx={styles.value}>{invoice.invoice.cost_center || '-'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>Created At</Typography>
                          <Typography sx={styles.value}>
                            {invoice.invoice.created_at ? new Date(invoice.invoice.created_at).toLocaleString() : '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>Currency</Typography>
                          <Typography sx={styles.value}>{invoice.invoice.currency || '-'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>Amount</Typography>
                          <Typography sx={styles.value} fontWeight="bold">
                            {invoice.invoice.amount || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={styles.infoItem}>
                          <Typography sx={styles.label}>Prepared By</Typography>
                          <Typography sx={styles.value}>
                            {invoice.invoice.invoice_owner ? 
                              `${invoice.invoice.invoice_owner.firstname} ${invoice.invoice.invoice_owner.lastname}` : 
                              '-'
                            }
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Box sx={styles.actionBar}>
                  <Comment selected={selectedId} />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(event) => handleDownloadInvoice(event, invoice)}
                    startIcon={<DownloadIcon />}
                  >
                    Download Invoice
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Approval Workflow
              </Typography>
              
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={styles.stepper}
              >
                {invoice?.invoice_histories?.map((invoiceItem, index) => (
                  <Step
                    key={index}
                    onClick={() => handleStepClick(invoiceItem?.status)}
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
                        {index + 1}
                      </StepIndicator>
                    }
                  >
                    <StepLabel sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight="500">
                        {invoiceItem?.status === 'pending'
                          ? 'To be signed by: '
                          : invoiceItem?.status === 'to sign'
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
                      {invoiceItem?.status === 'signed' && (
                        <Typography variant="caption" display="block">
                          Signed on:{' '}
                          {invoiceItem?.updated_at &&
                            new Date(invoiceItem?.updated_at).toLocaleString()}
                        </Typography>
                      )}
                      {invoiceItem?.status === 'signed' && (
                        <Box sx={styles.qrCode}>
                          <Typography variant="caption" display="block" mb={1}>
                            Signature (Click to verify):
                          </Typography>
                          <Box 
                            onClick={() => handleVerifySignature(invoiceItem)}
                            sx={{ 
                              cursor: 'pointer',
                              border: '1px solid #eee',
                              p: 1,
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: '#f5f5f5'
                              }
                            }}
                          >
                            <QRCodeSVG
                              size={100}
                              value={
                                invoiceItem?.signature
                                  ? `${
                                      process.env.REACT_APP_URL
                                    }/verify-signature/${
                                      invoice?.invoice?.id
                                    }/${encodeURIComponent(
                                      invoiceItem?.public_key
                                        ?.replace(
                                          '-----BEGIN PUBLIC KEY-----\n',
                                          ''
                                        )
                                        ?.replace(
                                          '\n-----END PUBLIC KEY-----',
                                          ''
                                        )
                                        ?.replace(/\n/g, '')
                                    )}/${encodeURIComponent(
                                      invoiceItem?.signature
                                    )}`
                                  : ''
                              }
                            />
                          </Box>
                        </Box>
                      )}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </>
          )}
        </Box>
        
        {open && (
          <StepperModal
            isAllowed={isAllowed}
            open={open}
            handleClose={handleClose}
            selectedId={selected?.invoice?.id || selected?.id}
            reloadFunction={getInvoiceTrackingData}
            invoice={invoice}
            isRollBack={invoice.invoice.is_roll_back}
          />
        )}
      </Paper>
    </Modal>
  );
}

export default InvoiceTracking;