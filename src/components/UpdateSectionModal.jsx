import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Modal,
  Divider,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UpdateIcon from '@mui/icons-material/Update';

import { getAllSection, updateSection } from '../features/section/sectionSlice';
import { getSectionFromErp } from '../features/section/sectionSlice';
import { getAllSigners } from '../features/user/userSlice';
import { getAllDepartment } from '../features/department/departmentSlice';

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

function UpdateSectionModal({ defaultValues, open, handleClose }) {
  const { users } = useSelector((state) => state.user);
  const { allSections } = useSelector((state) => state.section);
  const { departments } = useSelector((state) => state.department);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: defaultValues?.name || '',
    lead_by: defaultValues?.lead_by?.id || '',
    department: defaultValues?.department?.id || '',
  });

  useEffect(() => {
    if (defaultValues) {
      setFormData({
        name: defaultValues?.name || '',
        lead_by: defaultValues?.lead_by?.id || '',
        department: defaultValues?.department?.id || '',
      });
    }
  }, [defaultValues]);

  useEffect(() => {
    dispatch(getSectionFromErp());
    dispatch(getAllSigners());
    dispatch(getAllDepartment());
  }, [dispatch]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const submit = async () => {
    await dispatch(updateSection({ id: defaultValues.id, formData }));
    handleClose();
    await dispatch(getAllSection());
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="update-section-modal-title"
    >
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" id="update-section-modal-title">
            Update Section
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={style.content}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="section-name-label">Section Name</InputLabel>
                <Select
                  labelId="section-name-label"
                  label="Section Name"
                  name="name"
                  value={formData?.name || ''}
                  onChange={handleChange}
                >
                  {allSections?.Sections?.map((section, index) => (
                    <MenuItem key={index} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  label="Department"
                  name="department"
                  value={formData?.department || ''}
                  onChange={handleChange}
                >
                  {departments?.results?.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="lead-by-label">Section Lead</InputLabel>
                <Select
                  labelId="lead-by-label"
                  name="lead_by"
                  label="Section Lead"
                  value={formData?.lead_by || ''}
                  onChange={handleChange}
                >
                  {users?.results?.map((user, index) => (
                    <MenuItem key={index} value={user?.id}>
                      {user?.firstname} {user?.lastname}
                    </MenuItem>
                  ))}
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
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={submit}
            startIcon={<UpdateIcon />}
            sx={{
              bgcolor: '#00529B',
              '&:hover': {
                bgcolor: '#003a6d',
              },
              borderRadius: '8px',
            }}
          >
            Update Section
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default UpdateSectionModal;