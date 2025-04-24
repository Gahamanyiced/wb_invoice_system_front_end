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
  Paper,
} from '@mui/material';

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    maxWidth: '95%',
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 0,
    overflow: 'hidden',
  },
  header: {
    bgcolor: '#00529B',
    color: 'white',
    py: 2,
    px: 3,
  },
  content: {
    p: 3,
  },
  footer: {
    p: 2,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
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
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="update-user-modal-title"
    >
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" id="update-user-modal-title">
            Update User
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={style.content}>
          <Box container sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                User: {defaultValues?.email || defaultValues?.firstname || 'Selected User'}
              </Typography>
            </Box>
            
            <Box>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="signer">Signer</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="signer_admin">Signer Admin</MenuItem>
                  <MenuItem value="supplier">Supplier</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
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
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={style.footer}>
          <Button
            variant="outlined"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submit}
            sx={{ 
              bgcolor: '#00529B',
              '&:hover': {
                bgcolor: '#003a6d',
              }
            }}
          >
            Update User
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default UpdateUserModel;