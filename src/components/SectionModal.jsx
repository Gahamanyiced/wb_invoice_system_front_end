import { Grid, FormControl, Autocomplete, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import AddIcon from '@mui/icons-material/Add';
import { addSection, getAllSection } from '../features/section/sectionSlice';
import { getSectionFromErp } from '../features/section/sectionSlice';
import { getAllDepartment } from '../features/department/departmentSlice';
import { getAllSigners } from '../features/user/userSlice';

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
  }, [dispatch]);

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
        sx={{ marginBottom: '20px', bgcolor: '#00529B', color: 'white' }}
        endIcon={<AddIcon />}
      >
        Add Section
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style.box}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5" align="center">
                Section Details
              </Typography>
            </Grid>
            <Grid item xs={12}>
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
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
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
                    <TextField {...params} label="Lead By" variant="outlined" />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
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
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
              <Button
                variant="contained"
                sx={{ marginTop: '20px', bgcolor: 'purple' }}
                onClick={submit}
              >
                Add
              </Button>
              <Button
                variant="contained"
                sx={{
                  marginTop: '20px',
                  bgcolor: '#00529B',
                  marginLeft: '20px',
                }}
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

export default SectionModal;
