import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Box,
  CircularProgress,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import CloseIcon from '@mui/icons-material/Close';
import AddCommentIcon from '@mui/icons-material/AddComment';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import Radio from '@mui/joy/Radio';
import ForwardingInvoiceDialog from './ForwardingInvoiceDialog';
import TextField from '@mui/material/TextField';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInvoice,
  commentInvoice,
  denyInvoice,
  rollbackInvoice,
  invoiceComment,
} from '../features/invoice/invoiceSlice';
import { checkHeadDepartment } from '../features/department/departmentSlice';
import { toast } from 'react-toastify';

function ApproveDialog(props) {
  const user = JSON?.parse(localStorage?.getItem('user'));
  const { isLoading } = useSelector((state) => state.invoice);
  const { isHeadDepartment } = useSelector((state) => state.department);
  const index = props?.index;
  const [idForInvoice, setIdForInvoice] = useState(props?.selectedId);
  const handleGoBack = props.handleGoBack;
  const [panel, setPanel] = useState(0);
  const dispatch = useDispatch();
  console.log('invoice_approve', props?.invoice?.invoice?.is_next_to_approve);

  useEffect(() => {
    if (index === 0) {
      dispatch(checkHeadDepartment());
    }
  }, [dispatch, index]);

  const styles = {
    modal: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 600, // Increased from 500 to 600
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4, // Increased padding for better spacing
      display: 'flex',
      flexDirection: 'column',
      gap: '20px', // Added gap for better spacing between elements
      alignItems: 'center',
    },
    cancel: {
      backgroundColor: '#8B8282',
      color: 'white',
      '&:hover': {
        backgroundColor: '#8B8282',
      },
    },
    approve: {
      backgroundColor: data[index].color,
      color: 'white',
      '&:hover': {
        backgroundColor: data[index].color,
      },
    },
    icon: {
      color: data[index].color,
      height: '50px',
      width: '50px',
      p: 0,
    },
  };

  const handleApprove = async () => {
    try {
      if (index === 0) {
        if (
          (isHeadDepartment?.is_head_of_department ||
            user?.role === 'signer_admin') &&
          !props.isRollBack
        ) {
          setPanel(1);
        } else {
          await dispatch(
            signInvoice({
              id: props.selectedId,
              data: {
                status: 'signed',
              },
            })
          );
          setPanel(2);
        }
      } else if (index === 1) {
        await dispatch(
          denyInvoice({
            id: props.selectedId,
            data: {},
          })
        );
        setPanel(2);
      } else if (index === 2) {
        await dispatch(
          rollbackInvoice({
            id: props.selectedId,
            data: {},
          })
        );
        setPanel(2);
      } else {
        return;
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleConfirmForwarding = async (final, selection) => {
    // Perform an action based on selected forward users
    const data = {
      id: props.selectedId,
      data: {
        status: 'signed',
      },
    };
    if (!final) {
      data.data['next_signers'] = selection;
    }
    await dispatch(signInvoice(data));
    setPanel(2);
  };

  const CommentConfirmDialog = (props) => {
    const [comment, setComment] = useState('');
    const [shouldLeaveComment, setShouldLeaveComment] = useState(0);

    const handleRadioChange = (event) => {
      setShouldLeaveComment(Number(event.target.value));
    };

    const handleLeaveComment = async () => {
      try {
        if (shouldLeaveComment || index === 1 || index === 2) {
          await dispatch(
            commentInvoice({
              id: props.selectedId,
              data: {
                content: comment,
              },
            })
          );
          await dispatch(invoiceComment({ id: props.selectedId }));
        }

        setComment('');
        setShouldLeaveComment(0);
        props.handleDialogClose();
      } catch (error) {
        toast.error(error);
      }
    };
    return (
      <Box sx={styles.modal}>
        <AddCommentIcon fontSize="50" sx={styles.icon} />
        <DialogTitle id="alert-dialog-title">
          Do you want to leave a comment?
        </DialogTitle>
        <DialogContent sx={{ width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: 2,
              width: '100%', // Ensures the Box takes the full width of DialogContent
            }}
          >
            {index === 1 || index === 2 ? (
              <TextField
                id="comment"
                label="Type your comment"
                multiline
                rows={6} // Increased from 4 to 6
                fullWidth // Makes the TextField span the full width
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{
                  resize: 'vertical',
                  width: '100%', // Ensures the TextField takes the full width of the Box
                }}
              />
            ) : (
              <>
                <Radio
                  checked={shouldLeaveComment === 1}
                  onChange={handleRadioChange}
                  value={1}
                  label="Yes"
                />

                <Radio
                  checked={shouldLeaveComment === 0}
                  onChange={handleRadioChange}
                  value={0}
                  label="No"
                />

                {shouldLeaveComment === 1 && (
                  <TextField
                    id="comment"
                    label="Type your comment"
                    multiline
                    rows={6} // Increased from 4 to 6
                    fullWidth // Makes the TextField span the full width
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{
                      resize: 'vertical',
                      width: '100%', // Ensures the TextField takes the full width of the Box
                    }}
                  />
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ width: '100%', justifyContent: 'center' }}>
          {isLoading ? (
            <CircularProgress size="25px" />
          ) : (
            <Button
              onClick={handleLeaveComment}
              autoFocus
              sx={styles.approve}
              disabled={
                index === 1 || index === 2
                  ? !comment.trim()
                  : shouldLeaveComment === 1 && !comment.trim()
              }
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </Box>
    );
  };

  // Renamed inner ApproveDialog to ApproveDialogContent to avoid naming conflict
  const ApproveDialogContent = () => {
    return (
      <Box sx={styles.modal}>
        <CheckCircleOutlineIcon sx={styles.icon} fontSize="50" />
        <DialogTitle id="alert-dialog-title">{data[index].title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {data[index].info}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ width: '100%', justifyContent: 'center' }}>
          <Button onClick={handleGoBack} sx={styles.cancel}>
            Cancel
          </Button>
          {isLoading ? (
            <CircularProgress size="25px" sx={{ marginLeft: '20px' }} />
          ) : (
            <Button onClick={handleApprove} autoFocus sx={styles.approve}>
              {data[index].action}
            </Button>
          )}
        </DialogActions>
      </Box>
    );
  };

  const panels = [
    <ApproveDialogContent key="approve-dialog-content" />,
    <ForwardingInvoiceDialog
      handleConfirmForwarding={handleConfirmForwarding}
      selectedId={idForInvoice}
      loading={isLoading}
      key="forwarding-invoice-dialog"
      invoice={props.invoice}
    />,
    <CommentConfirmDialog
      index={index}
      selectedId={props.selectedId}
      handleDialogClose={props.handleDialogClose}
      key="comment-confirm-dialog"
    />,
  ];

  return panels[panel];
}

export default ApproveDialog;

// Data array remains unchanged
const data = [
  {
    title: 'Are you sure you want to approve this invoice?',
    info: 'You will not be able to recover the action!',
    action: 'Approve',
    color: '#00529B',
    icon: (
      <CheckCircleOutlineIcon
        sx={{
          color: '#00529B',
          height: '50px',
          width: '50px',
          p: 0,
        }}
      />
    ),
  },
  {
    title: 'Are you sure you want to deny this invoice?',
    info: 'You will not be able to recover the action!',
    action: 'Deny',
    color: '#F20707',
    icon: (
      <CloseIcon
        sx={{
          color: '#F20707',
          height: '50px',
          width: '50px',
          p: 0,
        }}
      />
    ),
  },
  {
    title: 'Are you sure you want to rollback this invoice?',
    info: 'You will not be able to recover the action!',
    action: 'Rollback',
    color: '#4D915F',
    icon: (
      <KeyboardReturnIcon
        sx={{
          color: '#4D915F',
          height: '50px',
          width: '50px',
          p: 0,
        }}
      />
    ),
  },
  {
    title: 'Are you sure you want to escalate this invoice?',
    info: 'You will not be able to recover the action!',
    action: 'Escalate',
    color: '#270945',
    icon: (
      <MoveUpIcon
        sx={{
          color: '#270945',
          height: '50px',
          width: '50px',
          p: 0,
        }}
      />
    ),
  },
];
