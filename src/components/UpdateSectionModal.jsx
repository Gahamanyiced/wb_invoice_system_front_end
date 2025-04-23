import {
    Grid,
    FormControl,
    InputLabel,
    Input,
    Select,
    MenuItem,
    Box,
    Button,
    Typography,
    Modal,
  } from '@mui/material';
  import { useEffect, useState } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  
  import { getAllSection, updateSection } from '../features/section/sectionSlice';
  import { getSectionFromErp } from '../features/section/sectionSlice';
  import { getAllSigners } from '../features/user/userSlice';
  import { getAllDepartment } from '../features/department/departmentSlice';
  
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
  
  function UpdateSectionModal({ defaultValues, open, handleClose }) {
    const { users } = useSelector((state) => state.user);
    const { allSections } = useSelector((state) => state.section);
    const { departments } = useSelector((state) => state.department);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
      name: defaultValues?.name,
      lead_by: defaultValues?.lead_by?.id,
      department: defaultValues?.department?.id,
    });
  
    useEffect(() => {
      if (defaultValues) {
        setFormData({
          name: defaultValues?.name,
          lead_by: defaultValues?.lead_by?.id,
          department: defaultValues?.department?.id,
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
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style.box}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            align="center"
          >
            {' '}
            UPDATE SECTION
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Section Name</InputLabel>
                <Select
                  label="Section Name"
                  name="name"
                  value={formData?.name}
                  onChange={handleChange}
                >
                  {allSections?.Sections?.map((section, index) => (
                    <MenuItem key={index} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Lead By</InputLabel>
                <Select
                  name="lead_by"
                  label="Lead_by"
                  value={formData?.lead_by}
                  onChange={handleChange}
                >
                  {users?.results?.map((user, index) => (
                    <MenuItem key={index} value={user?.id}>
                      {user?.firstname} {user?.lastname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  name="department"
                  value={formData?.department}
                  onChange={handleChange}
                >
                  {departments?.results?.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
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
    );
  }
  
  export default UpdateSectionModal;
  