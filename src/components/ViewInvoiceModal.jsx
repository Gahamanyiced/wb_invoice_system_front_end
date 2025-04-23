import { Box, Typography, Modal, Button } from '@mui/material';
const styles = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    // border: '0 solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
};

function ViewInvoiceModal({ defaultValues, open, handleClose }) {
  // console.log('defaultValues', defaultValues);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={styles.modal}>
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          align="center"
        >
          INVOICE DETAILS
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          SUPPLIER NUMBER: {defaultValues?.supplier_number || defaultValues?.invoice?.supplier_number}
        </Typography>
        <Typography>
          SUPPLIER NAME: {defaultValues?.supplier_name || defaultValues?.invoice?.supplier_name}
        </Typography>
        <Typography>
          INVOICE NUMBER: {defaultValues?.invoice_number || defaultValues?.invoice?.invoice_number}
        </Typography>
        <Typography>
          SERVICE PERIOD: {defaultValues?.service_period || defaultValues?.invoice?.service_period}
        </Typography>
        <Typography>
          GL CODE: {defaultValues?.gl_code || defaultValues?.invoice?.gl_code}
        </Typography>
        <Typography>
          GL DESCRIPTION: {defaultValues?.gl_description || defaultValues?.invoice?.gl_description}
        </Typography>
        <Typography>
          LOCATION: {defaultValues?.location || defaultValues?.invoice?.location}
        </Typography>
        <Typography>
          COST CENTER: {defaultValues?.cost_center || defaultValues?.invoice?.cost_center}
        </Typography>
        <Typography>
          CURRENCY: {defaultValues?.currency || defaultValues?.invoice?.currency}
        </Typography>
        <Typography>
          AMOUNT: {defaultValues?.amount || defaultValues?.invoice?.amount}
        </Typography>
        <Typography>
          CREATED BY:{' '}
          {
            (defaultValues?.invoice_owner || defaultValues?.invoice?.invoice_owner)
              ?.firstname
          }{' '}
          {
            (defaultValues?.invoice_owner || defaultValues?.invoice?.invoice_owner)
              ?.lastname
          }
        </Typography>
        <Typography>
          STATUS: {defaultValues?.status || defaultValues?.invoice?.status}
        </Typography>
        <Typography>
          CREATED AT: {new Date(defaultValues?.created_at || defaultValues?.invoice?.created_at).toLocaleString()}
        </Typography>
        {(defaultValues?.documents || defaultValues?.invoice?.documents)?.map(
          (doc, index) => (
            <Typography key={index}>
              DOCUMENT {index + 1}:{' '}
              <a
                href={doc?.file_data}
                target="_blank"
                rel="noopener noreferrer"
              >
                VIEW THE DOCUMENT
              </a>
            </Typography>
          )
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ViewInvoiceModal;