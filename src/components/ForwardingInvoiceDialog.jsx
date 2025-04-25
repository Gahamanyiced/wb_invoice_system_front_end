import React, { useEffect, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  Button,
  DialogTitle,
  DialogActions,
  Box,
  CircularProgress,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

import { useDispatch, useSelector } from 'react-redux';
import {
  getAllSigners,
  getCeoSigner,
  getDceoSigner,
  getNextSigners,
} from '../features/user/userSlice';
import Select from 'react-select';

const styles = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    // border: '0 solid #000',
    boxShadow: 24,
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    alignItems: 'center',
  },
  approve: {
    backgroundColor: '#00529B',
    color: 'white',
    '&:hover': {
      backgroundColor: '#00529B',
    },
  },
  icon: {
    color: '#00529B',
    height: '50px',
    width: '50px',
    p: 0,
  },
};

const ForwardingInvoiceDialog = (props) => {
  const [selectedIds, setSelectedIds] = useState();
  const [final, setFinal] = useState(false);
  const { users } = useSelector((state) => state.user);
  console.log('users', users);
  const [user, setUser] = useState(JSON?.parse(localStorage?.getItem('user')));

  const dispatch = useDispatch();

  const handleCheckboxChange = () => {
    setFinal(!final);
  };
  const handleChangeIds = (users) => {
    setSelectedIds(users?.map((item) => item.id));
  };
  const handleSubmit = () => {
    props.handleConfirmForwarding(final, selectedIds);
  };

  useEffect(() => {
    if (user?.email === process.env.REACT_APP_CEO_OFFICE_EMAIL) {
      dispatch(getCeoSigner());
    } else if (user?.email === process.env.REACT_APP_DCEO_OFFICE_EMAIL) {
      dispatch(getDceoSigner());
    } else {
      dispatch(getNextSigners({ id: props?.selectedId }));
    }
  }, [dispatch, user, props?.selectedId]);

  return (
    <Box sx={styles.modal}>
      <CheckCircleOutlineIcon sx={styles.icon} fontSize="50" />
      <DialogTitle id="alert-dialog-title">Next To Sign</DialogTitle>
      {!final && (
        <FormControl sx={{ m: 1, width: 300 }}>
          {/* <Select options={users?.results?.map((item => { return { ...item, value: item.email, label: `${item.firstname} ${item.lastname}` } }))}
                    isMulti onChange={handleChangeEmails} /> */}
          <Select
            options={users?.results?.map((item) => {
              return {
                ...item,
                value: item.id,
                label: `${item.firstname} ${item.lastname} : ${item.position} `,
              };
            })}
            isMulti
            onChange={handleChangeIds}
          />
        </FormControl>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={final}
              onChange={() => handleCheckboxChange()}
              disabled={selectedIds?.length > 0}
            />
          }
          label="Mark As Final Aproval"
        />
      </Box>

      <DialogActions>
        {props.loading ? (
          <CircularProgress size="25px" />
        ) : (
          <Button onClick={handleSubmit} autoFocus sx={styles.submit}>
            Submit
          </Button>
        )}
      </DialogActions>
    </Box>
  );
};

export default ForwardingInvoiceDialog;
