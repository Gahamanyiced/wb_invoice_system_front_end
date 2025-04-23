import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
  } from '@mui/material';
  
  import { useDispatch } from 'react-redux';
  import { Dangerous } from '@mui/icons-material';
  
  const DeleteSigningFlowDialog = ({ open, handleClose, defaultValues }) => {
    const dispatch = useDispatch();
    const handleDelete = async () => {
      // await dispatch(deleteSection(defaultValues));
      handleClose();
      // await dispatch(getAllSection());
    };
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Dangerous color="error" />
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this Signing Flow?
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            autoFocus
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default DeleteSigningFlowDialog;
  