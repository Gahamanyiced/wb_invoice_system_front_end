import React from 'react';
import { Grid, FormControl, InputLabel, Input } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import AddIcon from '@mui/icons-material/Add';

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

function UserModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const dispatch = useDispatch();
  const [email, setEmail] = useState();
  const [role, setRole] = useState();

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangeRole = (e) => {
    setRole(e.target.value);
  };

  const submit = async () => {
    const data = new FormData();
    data.append('email', email);
    data.append('location', role);

   
    setOpen(false);
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{ marginBottom: '20px', bgcolor: '#00529B', color: 'white' }}
        endIcon={<AddIcon />}
      >
        Add User
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
              <Typography variant="h6">Details</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>EMAIL</InputLabel>
                <Input
                  placeholder="no.reply@rwandair.com"
                  onChange={handleChangeEmail}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>ROLE</InputLabel>
                <Input placeholder="CEO" onChange={handleChangeRole} />
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
                onClick={() => setOpen(false)}
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

export default UserModal;
