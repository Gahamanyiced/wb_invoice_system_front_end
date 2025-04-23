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

const ViewUserModal = ({ defaultValues, open, handleClose }) => {
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
