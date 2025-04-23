import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '@mui/material/Modal';
import { updateUser } from '../features/user/userSlice';

import {
  Grid,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';

const style = {
  box: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  },
  button: {
    marginBottom: '20px',
  },
};

function UpdateUserModel({ defaultValues, open, handleClose, setUpdateTrigger }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    role: '',
    is_approved: false,
  });

  // Use useEffect to update formData when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      setFormData({
        role: defaultValues.role || '',
        is_approved: defaultValues.is_approved || false,
      });
    }
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    await dispatch(updateUser({ id: defaultValues?.id, formData }));
    handleClose();
    setUpdateTrigger((prev) => !prev);
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style.box}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">Details</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>ROLE</InputLabel>
                <Select
                  label="ROLE"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="signer">Signer</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="signer_admin">Signer_Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Approval Status</InputLabel>
                <Select
                  label="Approval Status"
                  name="is_approved"
                  value={formData.is_approved}
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Approved</MenuItem>
                  <MenuItem value={false}>Not Approved</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
              <Button
                variant="contained"
                sx={{ marginTop: '20px', bgcolor: 'purple' }}
                onClick={submit}
              >
                Update
              </Button>
              <Button
                variant="contained"
                sx={{ marginTop: '20px', bgcolor: 'blue', marginLeft: '20px' }}
                onClick={handleClose}
              >
                Close
              </Button>
            </Box>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}

export default UpdateUserModel;