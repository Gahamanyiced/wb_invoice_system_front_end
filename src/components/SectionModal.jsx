import {
  Box,
  FormControl,
  Autocomplete,
  TextField,
  Button,
  Typography,
  Modal,
  Divider,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { addSection, getAllSection } from '../features/section/sectionSlice';
import { getSectionFromErp } from '../features/section/sectionSlice';
import { getAllDepartment } from '../features/department/departmentSlice';
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

function SectionModal() {
  const [page, setPage] = useState(1);
  const { users } = useSelector((state) => state.user);
  const { allSections } = useSelector((state) => state.section);
  const { departments } = useSelector((state) => state.department);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    lead_by: '',
    department: '',
  });

  useEffect(() => {
    dispatch(getAllSigners());
    dispatch(getSectionFromErp());
    dispatch(getAllDepartment(page));
  }, [dispatch, page]);

  const submit = async () => {
    await dispatch(addSection(formData));
    handleClose();
    await dispatch(getAllSection(page));
  };

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
        Add Section
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="section-modal-title"
      >
        <Box sx={style.modal}>
          {/* Header */}
          <Box sx={style.header}>
            <Typography variant="h6" id="section-modal-title">
              Add Section
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={style.content}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <FormControl fullWidth>
                  <Autocomplete
                    options={allSections?.Sections || []}
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
                        label="Section Name"
                        variant="outlined"
                        placeholder="Select or type section name"
                      />
                    )}
                  />
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <Autocomplete
                    options={departments?.results || []}
                    getOptionLabel={(option) => option?.name || ''}
                    value={
                      departments?.results?.find(
                        (dept) => dept.id === formData.department
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        department: newValue?.id || '',
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department"
                        variant="outlined"
                        placeholder="Select department"
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
                    value={
                      users?.results?.find(
                        (user) => user.id === formData.lead_by
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        lead_by: newValue?.id || '',
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Section Lead" 
                        variant="outlined"
                        placeholder="Select section lead"
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
              Save Section
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default SectionModal;