import { Box, Typography, Modal, Button, Divider, Chip } from '@mui/material';

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

const roleColors = {
  admin: '#9C27B0',
  signer_admin: '#00529B',
  signer: '#42A5F5',
  staff: '#66BB6A',
  supplier: '#FF9800',
};

const ViewUserModal = ({ defaultValues, open, handleClose }) => {
  const hasSupplierProfile = defaultValues?.supplier_profile;

  const roleLabel = (defaultValues?.role || 'N/A')
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const roleColor = roleColors[defaultValues?.role] || '#9E9E9E';

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
        <Typography>Position: {defaultValues?.position}</Typography>
        <Typography>Department: {defaultValues?.department}</Typography>
        <Typography>Section: {defaultValues?.section}</Typography>
        <Typography>Station: {defaultValues?.station}</Typography>

        {/* Role as a color-coded chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>Role:</Typography>
          <Chip
            label={roleLabel}
            size="small"
            sx={{ bgcolor: roleColor, color: 'white', fontWeight: 600 }}
          />
        </Box>

        {/* Approval status as chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>Approved:</Typography>
          <Chip
            label={defaultValues?.is_approved ? 'Yes' : 'No'}
            size="small"
            sx={{
              bgcolor: defaultValues?.is_approved ? '#66BB6A' : '#EF5350',
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Petty cash access as chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>Petty Cash User:</Typography>
          <Chip
            label={defaultValues?.is_petty_cash_user ? 'Enabled' : 'Disabled'}
            size="small"
            sx={{
              bgcolor: defaultValues?.is_petty_cash_user
                ? '#42A5F5'
                : '#9E9E9E',
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Additional role flags */}
        {[
          { label: 'Petty Cash Initiator', key: 'is_pettycash_initiator' },
          { label: 'Custodian', key: 'is_custodian' },
          { label: 'Expense Creator', key: 'is_expense_creator' },
          { label: 'Approver', key: 'is_approver' },
          { label: 'First Approver', key: 'is_first_approver' },
          { label: 'Second Approver', key: 'is_second_approver' },
          { label: 'Last Approver', key: 'is_last_approver' },
        ].map(({ label, key }) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography>{label}:</Typography>
            <Chip
              label={defaultValues?.[key] ? 'Yes' : 'No'}
              size="small"
              sx={{
                bgcolor: defaultValues?.[key] ? '#66BB6A' : '#9E9E9E',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        ))}

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
