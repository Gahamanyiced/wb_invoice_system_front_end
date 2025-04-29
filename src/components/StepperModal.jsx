// StepperModal.jsx
import { useState } from 'react';
import { Box, Typography, Modal, Link, Button, Grid, Divider, Chip } from '@mui/material';
import ApproveDialog from './ApproveDialog';

const styles = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '8px',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      width: '8px'
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '8px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '8px'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555'
    }
  },
  contentWrapper: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  description: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    width: '100%',
    paddingRight: '8px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '24px',
    gap: '16px'
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#00529B',
    marginBottom: '8px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '12px',
  },
  label: {
    color: '#666',
    fontSize: '0.85rem',
    fontWeight: 500,
    marginBottom: '4px',
  },
  value: {
    fontSize: '1rem',
    fontWeight: 400,
  },
  statusChip: {
    fontWeight: 'bold',
    marginLeft: '8px',
  },
  button: {
    backgroundColor: '#00529B',
    '&:hover': {
      backgroundColor: '#003a6d',
    },
  },
  denyButton: {
    backgroundColor: '#00529B',
    '&:hover': {
      backgroundColor: '#003a6d',
    },
  },
  rollbackButton: {
    backgroundColor: '#00529B',
    '&:hover': {
      backgroundColor: '#003a6d',
    },
  }
};

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
  
  const handleApproveClick = (index) => {
    setIndex(index);
  };

  const handleDialogClose = () => {
    setIndex();
    handleClose();
    reloadFunction();
  };

  const handleGoBack = () => {
    setIndex();
  };

  return (
    <Modal
      open={open}
      onClose={handleDialogClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
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
        />
      )}
    </Modal>
  );
}

const Actions = ({ isAllowed, handleApproveClick, invoice }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'default';
      case 'to sign': return 'primary';
      case 'signed': return 'success';
      case 'denied': return 'error';
      case 'rollback': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={styles.modal}>
      <Box sx={styles.contentWrapper}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            align="center"
          >
            INVOICE DETAILS
          </Typography>
          <Chip 
            label={(invoice?.invoice?.status || '').toUpperCase()}
            color={getStatusColor(invoice?.invoice?.status)}
            size="small"
            sx={styles.statusChip}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={styles.section}>
          <Typography sx={styles.sectionTitle}>Supplier Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>Supplier Number</Typography>
                <Typography sx={styles.value}>{invoice?.invoice?.supplier_number || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>Supplier Name</Typography>
                <Typography sx={styles.value}>{invoice?.invoice?.supplier_name || '-'}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={styles.section}>
          <Typography sx={styles.sectionTitle}>Invoice Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>Invoice Number</Typography>
                <Typography sx={styles.value}>{invoice?.invoice?.invoice_number || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>Service Period</Typography>
                <Typography sx={styles.value}>{invoice?.invoice?.service_period || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>GL Code</Typography>
                <Typography sx={styles.value}>{invoice?.invoice?.gl_code || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>GL Description</Typography>
                <Typography sx={styles.value}>{invoice?.invoice?.gl_description || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>Location</Typography>
                <Typography sx={styles.value}>{invoice?.invoice?.location || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>Cost Center</Typography>
                <Typography sx={styles.value}>{invoice?.invoice?.cost_center || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>Currency</Typography>
                <Typography sx={styles.value}>{invoice?.invoice?.currency || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={styles.detailItem}>
                <Typography sx={styles.label}>Amount</Typography>
                <Typography sx={styles.value} fontWeight="bold">{invoice?.invoice?.amount || '-'}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={styles.section}>
          <Typography sx={styles.sectionTitle}>Additional Information</Typography>
          <Box sx={styles.detailItem}>
            <Typography sx={styles.label}>Prepared By</Typography>
            <Typography sx={styles.value}>
              {invoice?.invoice?.invoice_owner ? 
                `${invoice?.invoice?.invoice_owner?.firstname || ''} ${invoice?.invoice?.invoice_owner?.lastname || ''}` : 
                '-'
              }
            </Typography>
          </Box>
          
          <Box sx={styles.detailItem}>
            <Typography sx={styles.label}>Created At</Typography>
            <Typography sx={styles.value}>
              {invoice?.invoice?.created_at ? new Date(invoice.invoice.created_at).toLocaleString() : '-'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={styles.section}>
          <Typography sx={styles.sectionTitle}>Documents</Typography>
          {invoice?.invoice?.documents?.length > 0 ? (
            invoice?.invoice?.documents?.map((doc, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography>
                  Document {index + 1}:{' '}
                  <Link href={doc?.file_data} target="_blank" rel="noopener noreferrer">
                    View Document
                  </Link>
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No documents attached</Typography>
          )}
        </Box>
        
        {isAllowed && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={styles.buttonContainer}>
              <Button
                variant="contained"
                sx={styles.button}
                onClick={() => handleApproveClick(1)}
                fullWidth
              >
                Approve
              </Button>
              <Button
                variant="contained"
                sx={styles.denyButton}
                onClick={() => handleApproveClick(2)}
                fullWidth
              >
                Deny
              </Button>
              <Button
                variant="contained"
                sx={styles.rollbackButton}
                onClick={() => handleApproveClick(3)}
                fullWidth
              >
                Rollback
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default StepperModal;