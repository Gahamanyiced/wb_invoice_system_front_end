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
    FormHelperText,
    Autocomplete,
  } from '@mui/material';
  import React, { useState, useEffect } from 'react';
  import { useForm } from 'react-hook-form';
  import { toast } from 'react-toastify';
  import { yupResolver } from '@hookform/resolvers/yup';
  import { getAllDepartment } from '../features/department/departmentSlice';
  import { useSelector, useDispatch } from 'react-redux';
  import { getAllUsers } from '../features/user/userSlice';
  import { getAllSigners } from '../features/user/userSlice';
  import { editingSigningFlowValidation } from '../validations/signingFlow';
  import {
    editSigningFlow,
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
      bgcolor: 'background.paper',
      // border: '2px solid #000',
      // boxShadow: 24,
      p: 4,
    },
    button: {
      marginBottom: '20px',
    },
  };
  
  // const steps = ['Select Action', 'Choose Approver'];
  
  const UpdateSigningFlow = ({ defaultValues, open, handleClose }) => {
    const loginUser = JSON.parse(localStorage.getItem('user'));
    const dispatch = useDispatch();
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set());
    const { users } = useSelector((state) => state.user);
  
    const isStepOptional = (step) => step === 1;
    const isStepSkipped = (step) => skipped.has(step);
  
    const [formData, setFormData] = useState({
      department: '',
      section: '',
      action: '',
      level: 0,
      approver: '',
    });
  
    useEffect(() => {
      dispatch(getAllSigners());
    }, [dispatch]);
  
    const steps =
      formData.action === 'add'
        ? ['Select Action', 'Choose Approver', 'Choose Level']
        : ['Select Action', 'Choose Approver'];
  
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm({
      resolver: yupResolver(editingSigningFlowValidation),
    });
  
    const onSubmit = () => {};
    const handleSubmitFormData = async () => {
      try {
        // Prepare the base updatedFormData object
        const loginUser = JSON.parse(localStorage.getItem('user'));
        let updatedFormData = {
          ...formData,
          department: defaultValues?.department_detail?.id,
          section: defaultValues?.section_detail?.id,
        };
  
        // Conditionally remove 'approver' if the action is 'delete'
        if (formData.action === 'delete') {
          const { approver, ...rest } = updatedFormData;
          updatedFormData = rest;
        }
  
  
  
        // Dispatch with the updated form data
        await dispatch(editSigningFlow(updatedFormData)).unwrap();
  
        toast.success('Signing Flow edited successfully');
        // Fetch the updated signing flows after submission
        loginUser?.role === 'signer_admin'
          ? await dispatch(getAllSigningFlowByDepartment())
          : await dispatch(getAllSigningFlows());
        handeCloseUpdate();
      } catch (error) {
        toast.error(error);
        handeCloseUpdate();
        loginUser?.role === 'signer_admin'
          ? await dispatch(getAllSigningFlowByDepartment())
          : await dispatch(getAllSigningFlows());
      }
    };
  
    const handeCloseUpdate = () => {
      setFormData({
        department: '',
        section: '',
        action: '',
        level: 0,
        approver: '',
      });
      setActiveStep(0);
      reset();
      handleClose();
    };
  
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
  
    const handleChange = (e) => {
      const { name, value } = e.target;
  
      // If name is 'level', convert value to a number
      const updatedValue = name === 'level' ? parseInt(value, 10) : value;
  
      setFormData((prev) => ({
        ...prev,
        [name]: updatedValue,
      }));
    };
  
    return (
      <Modal
        open={open}
        onClose={handeCloseUpdate}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style.box}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeStep === steps.length ? (
              <React.Fragment>
                <Typography sx={{ mt: 2, mb: 1 }}>All steps completed</Typography>
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
                    <FormControl variant="filled" sx={{ width: '40%' }}>
                      <InputLabel id="action-label">Action</InputLabel>
                      <Select
                        labelId="action-label"
                        id="action-select"
                        name="action"
                        value={formData?.action || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="delete">Delete</MenuItem>
                        <MenuItem value="add">Add</MenuItem>
                      </Select>
                    </FormControl>
                  )}
  
                  {activeStep === 1 && (
                    <FormControl variant="filled" sx={{ width: '40%' }}>
                      {formData.action === 'delete' ? (
                        <>
                          <Autocomplete
                            id="level-autocomplete"
                            size="small"
                            options={defaultValues?.levels || []}
                            getOptionLabel={(option) =>
                              `${option?.approver_detail?.firstname} (${option?.level})` ||
                              ''
                            }
                            value={
                              defaultValues?.levels?.find(
                                (level) => level.level === formData.level
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                level: newValue?.level || '',
                              }));
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Level"
                                variant="filled"
                              />
                            )}
                          />
                        </>
                      ) : (
                        <>
                          <Autocomplete
                            id="approver-autocomplete"
                            size="small"
                            options={users?.results || []}
                            getOptionLabel={(option) =>
                              `${option.firstname} ${option.lastname}` || ''
                            }
                            value={
                              users?.results?.find(
                                (user) => user.id === formData.approver
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                approver: newValue?.id || '',
                              }));
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Approver"
                                variant="filled"
                              />
                            )}
                          />
                        </>
                      )}
                    </FormControl>
                  )}
  
                  {activeStep === 2 && formData.action === 'add' && (
                    <TextField
                      type="number"
                      id="outlined-basic"
                      label="level"
                      variant="filled"
                      size="small"
                      sx={{ width: '40%' }}
                      name="level"
                      {...register('level', {
                        onChange: (e) => handleChange(e), // Ensure validation and state change both happen
                      })}
                      error={!!errors?.level}
                      helperText={errors?.level?.message}
                    />
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
    );
  };
  
  export default UpdateSigningFlow;
  