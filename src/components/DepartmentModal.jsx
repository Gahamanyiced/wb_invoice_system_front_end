import * as React from 'react';
import {
  Box,
  FormControl,
  Button,
  Typography,
  Modal,
  Autocomplete,
  TextField,
  Divider,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import {
  addDepartment,
  getAllDepartment,
  getDepartmentByErp,
} from '../features/department/departmentSlice';
import { getAllSigners } from '../features/user/userSlice';

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
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    p: 0,
    overflow: 'hidden',
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

function DepartmentModal() {
  const { users } = useSelector((state) => state.user);
  const { allDepartments } = useSelector((state) => state.department);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    lead_by: '',
  });

  const submit = async () => {
    await dispatch(addDepartment(formData));
    handleClose();
    await dispatch(getAllDepartment());
  };

  useEffect(() => {
    dispatch(getAllSigners());
    dispatch(getDepartmentByErp());
  }, [dispatch]);

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{ 
          marginBottom: '20px', 
          bgcolor: '#00529B', 
          color: 'white',
          borderRadius: '8px',
          '&:hover': {
            bgcolor: '#003a6d',
          },
        }}
        startIcon={<AddIcon />}
      >
        Add Department
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="department-modal-title"
      >
        <Box sx={style.modal}>
          {/* Header */}
          <Box sx={style.header}>
            <Typography variant="h6" id="department-modal-title">
              Add Department
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={style.content}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <FormControl fullWidth>
                  <Autocomplete
                    options={allDepartments?.Departments || []}
                    getOptionLabel={(option) => option || ''}
                    value={formData.name}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        name: newValue || '',
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department Name"
                        variant="outlined"
                        placeholder="Select or type department name"
                      />
                    )}
                  />
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <Autocomplete
                    options={users?.results || []}
                    getOptionLabel={(option) => 
                      option ? `${option.firstname} ${option.lastname}` : ''
                    }
                    value={users?.results?.find(user => user.id === formData.lead_by) || null}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        lead_by: newValue?.id || '',
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Lead By"
                        variant="outlined"
                        placeholder="Select department head"
                      />
                    )}
                  />
                </FormControl>
              </Box>
            </Box>
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
              startIcon={<SaveIcon />}
              sx={{ 
                bgcolor: '#00529B',
                '&:hover': {
                  bgcolor: '#003a6d',
                },
                borderRadius: '8px'
              }}
            >
              Save Department
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default DepartmentModal;