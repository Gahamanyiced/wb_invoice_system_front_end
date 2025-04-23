import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    Autocomplete,
  } from '@mui/material';
  import { useForm } from 'react-hook-form';
  import { toast } from 'react-toastify';
  import { yupResolver } from '@hookform/resolvers/yup';
  import { createSigningFlowValidation } from '../validations/signingFlow';
  import React, { useState, useEffect } from 'react';
  import { useSelector, useDispatch } from 'react-redux';
  import AddIcon from '@mui/icons-material/Add';
  import { getAllDepartment } from '../features/department/departmentSlice';
  import { getAllSigners, getAllUsers } from '../features/user/userSlice';
  import {
    getAllSection,
    getAllSectionByDepartmentId,
  } from '../features/section/sectionSlice';
  import {
    addSigningFlow,
    getAllSigningFlowByDepartment,
    getAllSigningFlows,
  } from '../features/signingFlow/signingFlowSlice';
  
  const style = {
    box: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 900,
      height: 'auto',
      maxHeight: '90vh',
      bgcolor: 'background.paper',
      // border: '2px solid #000',
      // boxShadow: 24,
      p: 4,
      overflowY: 'auto',
    },
    button: {
      marginBottom: '20px',
      bgcolor: 'purple',
      color: 'white',
    },
  };
  const steps = [
    'Select Department',
    'Select Section',
    'Enter Number of Flows',
    'Select Signers',
  ];
  
  const SigningFlowModal = () => {
    const loginUser = JSON.parse(localStorage.getItem('user'));
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm({
      resolver: yupResolver(createSigningFlowValidation),
    });
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
      setOpen(false);
      setFlow(0);
      setFormData({
        department: '',
        section: '',
        levels: [],
      });
      setActiveStep(0);
      reset();
    };
    const [activeStep, setActiveStep] = useState(0);
  
    const [page, setPage] = useState(1);
    const [skipped, setSkipped] = useState(new Set());
    const [flow, setFlow] = useState(0);
    const [formData, setFormData] = useState({
      department: '',
      section: '',
      levels: [],
    });
    const { departments } = useSelector((state) => state.department);
    const { sections } = useSelector((state) => state.section);
  
    const { users } = useSelector((state) => state.user);
  
    useEffect(() => {
      dispatch(getAllDepartment());
      // dispatch(getAllSection());
      // dispatch(getAllUsers(page));
      dispatch(getAllSigners());
    }, [dispatch, page]);
  
    const isStepOptional = (step) => step === 1;
    const isStepSkipped = (step) => skipped.has(step);
  
    const handleNext = () => {
      let newSkipped = skipped;
      if (isStepSkipped(activeStep)) {
        newSkipped = new Set(newSkipped.values());
        newSkipped.delete(activeStep);
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped(newSkipped);
    };
  
    const handleBack = () =>
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
  
    const handleSkip = () => {
      if (!isStepOptional(activeStep)) {
        throw new Error("You can't skip a step that isn't optional.");
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped((prevSkipped) => {
        const newSkipped = new Set(prevSkipped.values());
        newSkipped.add(activeStep);
        return newSkipped;
      });
    };
  
    const handleReset = () => setActiveStep(0);
  
    const onSubmit = () => {};
  
    const handleSubmitFormData = async () => {
      try {
        await dispatch(addSigningFlow(formData)).unwrap();
        toast.success('Signing Flow added successfully');
        handleClose();
        loginUser?.role === 'signer_admin'
          ? await dispatch(getAllSigningFlowByDepartment())
          : await dispatch(getAllSigningFlows());
      } catch (error) {
        toast.error(error);
        handleClose();
        loginUser?.role === 'signer_admin'
          ? await dispatch(getAllSigningFlowByDepartment())
          : await dispatch(getAllSigningFlows());
      }
    };
  
    const handleChange = async (e) => {
      const { name, value } = e.target;
  
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleChangeFlow = (e) => {
      setFlow(e.target.value);
    };
  
    return (
      <div>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{ marginBottom: '20px', bgcolor: '#00529B', color: 'white' }}
          endIcon={<AddIcon />}
        >
          Add Flow
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style.box}>
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <form onSubmit={handleSubmit(onSubmit)}>
              {activeStep === steps.length ? (
                <React.Fragment>
                  <Typography sx={{ mt: 2, mb: 1 }}>
                    All steps completed
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      pt: 2,
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button onClick={handleReset}>Reset</Button>
                    <Button onClick={handleSubmitFormData}>Submit</Button>
                  </Box>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Box sx={{ mt: '20px' }}>
                    {activeStep === 0 && (
                      <Autocomplete
                        id="department-autocomplete"
                        size="small"
                        sx={{ width: '40%' }}
                        options={departments?.results || []}
                        getOptionLabel={(option) => option?.name || ''}
                        value={
                          departments?.results?.find(
                            (department) => department.id === formData.department
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            department: newValue?.id || '',
                          }));
                          // Trigger the department selection logic here
                          dispatch(getAllSectionByDepartmentId(newValue?.id));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Department"
                            variant="filled"
                          />
                        )}
                      />
                    )}
  
                    {activeStep === 1 && (
                      <Autocomplete
                        id="section-autocomplete"
                        size="small"
                        sx={{ width: '40%' }}
                        options={sections || []}
                        getOptionLabel={(option) => option?.name || ''}
                        value={
                          sections?.find(
                            (section) => section.id === formData.section
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            section: newValue?.id || '',
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Section"
                            variant="filled"
                          />
                        )}
                      />
                    )}
  
                    {activeStep === 2 && (
                      <TextField
                        type="number"
                        id="outlined-basic"
                        label="Flow"
                        variant="filled"
                        size="small"
                        sx={{ width: '40%' }}
                        // name="flow"
                        // onChange={handleChange}
                        {...register('numberOfLevel', {
                          onChange: (e) => handleChangeFlow(e), // Ensure validation and state change both happen
                        })}
                        error={!!errors?.numberOfLevel}
                        helperText={errors?.numberOfLevel?.message}
                      />
                    )}
  
                    {activeStep === 3 && (
                      <Box>
                        {Array.from({ length: flow }).map((_, index) => (
                          <Autocomplete
                            key={index}
                            id={`signer-autocomplete-${index}`}
                            size="small"
                            sx={{ width: '40%', m: 2, display: 'flex' }}
                            options={users?.results || []}
                            getOptionLabel={(option) =>
                              `${option?.firstname} ${option?.lastname}`
                            }
                            value={
                              users?.results?.find(
                                (user) =>
                                  user.id === formData.levels[index]?.approver
                              ) || null
                            } // Set the value
                            onChange={(event, newValue) => {
                              const updatedLevels = [...formData.levels];
                              updatedLevels[index] = {
                                level: index + 1,
                                approver: newValue?.id || '',
                              };
                              setFormData((prev) => ({
                                ...prev,
                                levels: updatedLevels,
                              }));
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={`Signer ${index + 1}`}
                                variant="filled"
                              />
                            )}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                      color="inherit"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button onClick={handleNext} type="submit">
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </Box>
                </React.Fragment>
              )}
            </form>
          </Box>
        </Modal>
      </div>
    );
  };
  
  export default SigningFlowModal;
  