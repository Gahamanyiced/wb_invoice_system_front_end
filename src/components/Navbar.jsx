import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Avatar,
    Box,
    Switch
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { reset, logout } from '../features/auth/authSlice';
import Logo from '../assets/images/logo.jpg';

const label = { inputProps: { 'aria-label': 'Switch demo' } };

export default function Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userJSON = localStorage.getItem('user');
    const user = userJSON ? JSON.parse(userJSON) : {};

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <>
            <AppBar
                position="static"
                sx={{ marginBottom: '1px', bgcolor: '#00529B' }}
            >
                <Toolbar>
                    <div style={{ flex: 1 }}></div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                bgcolor: 'gray.200',
                                width: 40,
                                height: 40,
                                marginRight: '20px',
                            }}
                        ></Avatar>
                        <Typography>{user.email}</Typography>
                        <Typography sx={{ marginLeft: '30px' }}>LOGOUT</Typography>

                        <Switch {...label} onClick={handleLogout} sx={{ marginLeft: '10px' }} />
                    </div>
                </Toolbar>
            </AppBar>
        </>
    );
}
