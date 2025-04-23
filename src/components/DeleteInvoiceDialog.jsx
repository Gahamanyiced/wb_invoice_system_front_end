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
  import { deleteInvoice, getInvoiceByUser } from '../features/invoice/invoiceSlice';
  import { toast } from 'react-toastify';
  import { useNavigate } from 'react-router-dom';
  
  const DeleteInvoiceDialog = ({ open, handleClose, defaultValues, page }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleDelete = async () => {
      try {
        await dispatch(deleteInvoice(defaultValues?.id));
        toast.success(`Invoice deleted successfully`);
        handleClose();
        await dispatch(getInvoiceByUser({ page }));
      } catch (error) {
        toast.error(error);
        handleClose();
      }
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
              Are you sure you want to delete this Invoice?
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
  
  export default DeleteInvoiceDialog;
  