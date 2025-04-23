import React from 'react';
import { Box, Typography, Modal, Button } from '@mui/material';

const styles = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    // border: '0 solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
};

const ViewSigningFlow = ({ defaultValues, open, handleClose }) => {

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
          SIGNING FLOW DETAILS
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 1 }}>
          DEPARTMENT: {defaultValues?.department_detail?.name}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 1 }}>
          SECTION: {defaultValues?.section_detail?.name}
        </Typography>
        {/* <Typography id="modal-modal-description" sx={{ mt: 1 }}>
          NUMBER OF FLOW: {defaultValues?.number_of_flows}
        </Typography> */}
        {defaultValues?.levels?.map((signer, index) => (
          <Typography>
            SIGNER {index+1}: {signer?.approver_detail?.firstname} {signer?.approver_detail?.lastname} ({signer?.approver_detail?.position})
          </Typography>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewSigningFlow;
