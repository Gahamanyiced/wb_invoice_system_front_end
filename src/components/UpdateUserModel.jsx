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
  TextField,
  Paper,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    maxWidth: '95%',
    bgcolor: '#f5f5f5',
    borderRadius: '12px',
    boxShadow: 24,
    p: 0,
    overflow: 'hidden',
    maxHeight: '90vh',
  },
  header: {
    bgcolor: '#00529B',
    color: 'white',
    py: 2,
    px: 3,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    p: 0,
    overflowY: 'auto',
    maxHeight: 'calc(90vh - 130px)',
  },
  section: {
    p: 3,
    mb: 2,
    bgcolor: 'white',
  },
  footer: {
    p: 2,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    bgcolor: 'white',
  },
};

function UpdateUserModel({
  defaultValues,
  open,
  handleClose,
  setUpdateTrigger,
}) {
  console.log('defaultValues', defaultValues);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    department: '',
    section: '',
    role: '',
    is_approved: false,
  });

  // Use useEffect to update formData when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      setFormData({
        firstname: defaultValues.firstname || '',
        lastname: defaultValues.lastname || '',
        email: defaultValues.email || '',
        department: defaultValues.department || '',
        section: defaultValues.section || '',
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
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={style.content}>
          {/* Personal Information Section */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Personal Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Work Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="email"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Work Information Section */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Work Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* System Access Section */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              System Access & Permissions
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="signer">Signer</MenuItem>
                    <MenuItem value="signer_admin">Signer Admin</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="supplier">Supplier</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
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
            </Grid>
          </Paper>
        </Box>

        {/* Footer */}
        <Box sx={style.footer}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ borderRadius: '8px' }}
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
              },
              borderRadius: '8px',
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
