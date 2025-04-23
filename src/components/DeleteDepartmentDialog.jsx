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
  import {
    deleteDepartment,
    getAllDepartment,
  } from '../features/department/departmentSlice';
  
  function DeleteDepartmentDialog({ open, handleClose, defaultValues }) {
    const dispatch = useDispatch();
    const handleDelete = async () => {
      await dispatch(deleteDepartment(defaultValues));
      handleClose();
      await dispatch(getAllDepartment());
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
              Are you sure you want to delete this department?
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
  }
  
  export default DeleteDepartmentDialog;
  