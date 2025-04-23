import React, { useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import { invoiceComment } from '../features/invoice/invoiceSlice';
import { useDispatch, useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';

function Comment({ selected }) {
  const { invoices } = useSelector((state) => state.invoice);
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const chatEndRef = useRef(null);
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const styles = {
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#3f51b5',
      '&:hover': {
        backgroundColor: '#303f9f',
      },
    },
    modal: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '90%', sm: '80%', md: '60%' },
      height: '80%',
      maxWidth: '800px',
      bgcolor: 'background.paper',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      p: 0,
    },
    header: {
      backgroundColor: '#00529B',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    headerToolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingRight: '8px',
    },
    headerTitle: {
      fontWeight: 500,
    },
    closeButton: {
      color: 'white',
    },
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      overflow: 'hidden',
      padding: '16px',
      backgroundColor: '#f5f8fa',
    },
    chatList: {
      flexGrow: 1,
      overflowY: 'auto',
      padding: '8px 4px',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#c1c1c1',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#a8a8a8',
      },
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#707070',
      gap: '16px',
      padding: '24px',
    },
    emptyIcon: {
      fontSize: '60px',
      color: '#9e9e9e',
      marginBottom: '16px',
    },
    commentItem: {
      marginBottom: '16px',
    },
    commentBubble: (isEven) => ({
      padding: '12px 16px',
      borderRadius: '12px',
      backgroundColor: isEven ? alpha('#00529B', 0.08) : 'white',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      marginLeft: '8px',
      position: 'relative',
    }),
    avatar: {
      width: 40,
      height: 40,
      backgroundColor: (theme) => theme.palette.primary.main,
      color: 'white',
      fontWeight: 'bold',
    },
    nameContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '4px',
    },
    commenterName: {
      fontWeight: '600',
      color: '#212121',
      fontSize: '0.95rem',
    },
    commentDate: {
      fontSize: '0.75rem',
      color: '#757575',
    },
    commentText: {
      color: '#424242',
      fontSize: '0.95rem',
      lineHeight: 1.5,
      wordBreak: 'break-word',
    },
    badgeCount: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: '#f44336',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: 'bold',
    },
  };

  useEffect(() => {
    if (selected) {
      dispatch(invoiceComment({ id: selected }));
    }
  }, [dispatch, selected]);
  
  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [open, invoices]);

  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const commentCount = invoices?.results?.length || 0;

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        sx={styles.button}
        onClick={handleOpen}
        startIcon={<ChatIcon />}
      >
        Comments
        {commentCount > 0 && (
          <Box component="span" sx={styles.badgeCount}>
            {commentCount}
          </Box>
        )}
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="comments-modal-title"
      >
        <Paper sx={styles.modal}>
          <AppBar position="static" sx={styles.header} elevation={0}>
            <Toolbar sx={styles.headerToolbar}>
              <Typography variant="h6" component="div" sx={styles.headerTitle}>
                Invoice Comments
              </Typography>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={handleClose}
                sx={styles.closeButton}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Box sx={styles.chatContainer}>
            {invoices?.results?.length > 0 ? (
              <List sx={styles.chatList}>
                {invoices.results.map((comment, index) => (
                  <ListItem 
                    key={index} 
                    alignItems="flex-start" 
                    sx={styles.commentItem}
                    disableGutters
                  >
                    <Avatar sx={styles.avatar}>
                      {getInitials(comment.commented_by?.firstname, comment.commented_by?.lastname)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Paper sx={styles.commentBubble(index % 2 === 0)} elevation={0}>
                        <Box sx={styles.nameContainer}>
                          <Typography sx={styles.commenterName}>
                            {`${comment.commented_by?.firstname || ''} ${comment.commented_by?.lastname || ''}`}
                          </Typography>
                          <Typography sx={styles.commentDate}>
                            {formatDate(comment?.created_at)}
                          </Typography>
                        </Box>
                        <Typography sx={styles.commentText}>
                          {comment.content}
                        </Typography>
                      </Paper>
                    </Box>
                  </ListItem>
                ))}
                <div ref={chatEndRef} />
              </List>
            ) : (
              <Box sx={styles.emptyState}>
                <MessageIcon sx={styles.emptyIcon} />
                <Typography variant="h6">No Comments Yet</Typography>
                <Typography variant="body2" align="center">
                  There are no comments on this invoice. Comments will appear here when they are added.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Modal>
    </>
  );
}

export default Comment;