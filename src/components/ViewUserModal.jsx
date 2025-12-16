import { Box, Typography, Modal, Button, Divider } from '@mui/material';

const styles = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
};

const ViewUserModal = ({ defaultValues, open, handleClose }) => {
  const hasSupplierProfile = defaultValues?.supplier_profile;

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
          USER DETAILS
        </Typography>

        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Firstname: {defaultValues?.firstname}
        </Typography>
        <Typography>Lastname: {defaultValues?.lastname}</Typography>
        <Typography>Company Email: {defaultValues?.email}</Typography>
        <Typography>Personal Email: {defaultValues?.personal_email}</Typography>
        <Typography>Department: {defaultValues?.department}</Typography>
        <Typography>Section: {defaultValues?.section}</Typography>
        <Typography>Station: {defaultValues?.station}</Typography>
        <Typography>Role: {defaultValues?.role}</Typography>
        <Typography>Position: {defaultValues?.position}</Typography>
        <Typography>Approved: {`${defaultValues?.is_approved}`}</Typography>
        <Typography>
          Petty Cash User: {`${defaultValues?.is_petty_cash_user}`}
        </Typography>

        {hasSupplierProfile && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" component="h3" sx={{ mt: 1 }}>
              SUPPLIER PROFILE
            </Typography>
            <Typography>
              Company Name: {defaultValues.supplier_profile.company_name}
            </Typography>
            <Typography>
              Supplier Number: {defaultValues.supplier_profile.supplier_number}
            </Typography>
            <Typography>
              Tax ID: {defaultValues.supplier_profile.tax_id}
            </Typography>
            <Typography>
              Service Category:{' '}
              {defaultValues.supplier_profile.service_category}
            </Typography>
            <Typography>
              Contact Name: {defaultValues.supplier_profile.contact_name}
            </Typography>
            <Typography>
              Phone Number: {defaultValues.supplier_profile.phone_number}
            </Typography>
            <Typography>
              Street Address: {defaultValues.supplier_profile.street_address}
            </Typography>
            <Typography>City: {defaultValues.supplier_profile.city}</Typography>
            <Typography>
              Country: {defaultValues.supplier_profile.country}
            </Typography>
            <Typography>
              Bank Name: {defaultValues.supplier_profile.bank_name}
            </Typography>
            <Typography>
              Account Name: {defaultValues.supplier_profile.account_name}
            </Typography>
            <Typography>
              Account Number: {defaultValues.supplier_profile.account_number}
            </Typography>
            <Typography>IBAN: {defaultValues.supplier_profile.iban}</Typography>
            <Typography>
              SWIFT Code: {defaultValues.supplier_profile.swift_code}
            </Typography>
            <Typography>
              Sort Code: {defaultValues.supplier_profile.sort_code}
            </Typography>
            <Typography>
              Payment Currency:{' '}
              {defaultValues.supplier_profile.payment_currency}
            </Typography>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewUserModal;
