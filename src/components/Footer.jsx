import { Box, Container, Typography } from '@mui/material';

function Footer() {
    return (
        <Box
            sx={{
                backgroundColor: '#00529B00',
                minHeight: '20px',
                position: 'fixed',
                bottom: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
            }}
            component="footer"
        >
            <Container maxWidth="sm">
                <Typography variant="body2" color="#00529B" align="center">
                    {'Copyright © Rwandair '}

                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
            </Container>
        </Box>
    );
}

export default Footer;
