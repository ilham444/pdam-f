// src/pages/Login.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    // State Anda sudah benar
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                email: identifier,
                password: password
            });
            // ------------------------------------

            const token = response.data.token;
            localStorage.setItem('token', token);

            const userData = jwtDecode(token);
            localStorage.setItem('user', JSON.stringify({
                id: userData.id,
                email: userData.email,
                role: userData.role
            }));
            
            // Menggunakan navigate langsung lebih baik daripada alert
            navigate('/dashboard');

        } catch (error) {
            const message = error.response?.data?.message || 'Login Gagal. Periksa kembali akun Anda.';
            alert(message); // Alert untuk menampilkan error sudah bagus
        } finally {
            setLoading(false);
        }
    };

    // JSX Anda sudah bagus, tidak perlu diubah
    return (
        <div className="min-h-screen p-8 bg-linear-to-r from-gray-200 to-blue-300/70">
            <img src="./logo.png" alt="" className='w-20 h-20' />
            <div className="w-full sm:w-3/4 lg:w-1/2 drop-shadow-lg mx-auto max-h-fit bg-white/50 rounded-4xl px-10 py-20 flex items-center justify-center">
                <div className="w-full">
                    <h1 className='font-semibold text-2xl text-center'>Sign In</h1>
                    <h5 className="text-gray-500 text-center">Masuk untuk melanjutkan</h5>
                    <div className="border border-gray-300 my-8 w-3/4 mx-auto"></div>
                    <form onSubmit={handleLogin} className="w-3/4 mx-auto">
                        <h1 className="">Email</h1>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder='email@example.com'
                            className='py-2 px-4 border rounded-2xl bg-gray-50 w-full border-gray-400 shadow-md mb-8'
                            required
                        />
                        <h1 className="">Password</h1>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Password'
                            className='py-2 px-4 border rounded-2xl bg-gray-50 w-full border-gray-400 shadow-md mb-8'
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className='rounded-full w-full p-3 bg-blue-400/70 hover:bg-blue-400 text-white font-medium shadow-md'
                        >
                            {loading ? 'Loading..' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;