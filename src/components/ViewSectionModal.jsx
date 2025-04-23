import { Box, Typography, Modal, Button } from '@mui/material';
const styles = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    // border: '0 solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
};

function ViewSectionModal({ defaultValues, open, handleClose }) {
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
          SECTION DETAILS
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          SECTION NAME: {defaultValues?.name}
        </Typography>
        <Typography>
          LEAD BY: {defaultValues?.lead_by?.firstname}{' '}
          {defaultValues?.lead_by?.lastname}
        </Typography>
        <Typography>DEPARTMENT: {defaultValues?.department?.name}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ViewSectionModal;
