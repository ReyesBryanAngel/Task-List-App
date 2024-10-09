import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import secureLocalStorage from "react-secure-storage";
import { useGlobalData } from '../context/GlobalDataProvider';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3000';
    const { setAccessToken } =  useGlobalData();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${baseUrl}/api/login`, {
                username,
                password,
            });

            if (response?.status === 200) {
                secureLocalStorage.setItem('accessToken', JSON.stringify(response?.data?.token));
                setAccessToken(response?.data?.token)
                navigate('/tasks');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError('Invalid username or password');
        }
    };

    return (
        <div className='flex flex-col h-screen justify-center'>
            <Container
                component={Paper}
                elevation={3}
                maxWidth="sm"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    padding: 3,
                    backgroundColor: '#f5f5f5'
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Welcome
                </Typography>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && (
                        <Typography color="error" variant="body2" align="center">
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 2 }}
                    >
                        Login
                    </Button>
                </form>
            </Container>
        </div>
    );
};

export default Login;
