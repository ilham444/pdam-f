// src/pages/ManagePegawai.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import './ManagePegawai.css'; // Assuming you have this CSS file
import Navbar from '../components/Navbar'; // Import the Navbar

const ManagePegawai = () => {
    // All your existing state and logic is correct
    const [pegawaiList, setPegawaiList] = useState([]);
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchPegawai = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/admin/pegawai', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPegawaiList(response.data);
        } catch (err) {
            console.error("Gagal mengambil data pegawai:", err);
            setError('Gagal memuat data pegawai.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPegawai();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            await api.post('/admin/create-pegawai', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Akun pegawai berhasil dibuat!');
            setFormData({ nama: '', email: '', password: '' });
            fetchPegawai(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat membuat akun');
        }
    };

    return (
        // Structure with Navbar
        <div className="bg-gray-200 min-h-screen"> 
            <div className="pt-24 px-10 sm:px-16">
                <Navbar />
                
                {/* --- ALL YOUR ORIGINAL PAGE CONTENT GOES HERE --- */}
                {/* I have added the 'mt-16' class to the h1 to give it space from the fixed navbar */}
                <h1 className="text-3xl font-bold mt-16 mb-8 text-black">Manajemen Akun Pegawai</h1>
                
                <div className="card">
                    <h3>Buat Akun Baru</h3>
                    <form onSubmit={handleSubmit} className="create-pegawai-form">
                        <div className="form-group">
                            <label htmlFor="nama">Nama Lengkap</label>
                            <input type="text" id="nama" name="nama" value={formData.nama} onChange={handleChange} placeholder="cth: Budi Santoso" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email (untuk login)</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="cth: budi@pdam.com" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 karakter" required />
                        </div>
                        <button type="submit" className="submit-btn">Buat Akun</button>
                    </form>
                    {error && <p className="feedback-message error-message">{error}</p>}
                    {success && <p className="feedback-message success-message">{success}</p>}
                </div>

                <div className="card">
                    <h3>Daftar Pegawai</h3>
                    <div className="table-wrapper">
                        {isLoading ? (
                            <p className="empty-list-message">Memuat data...</p>
                        ) : pegawaiList.length > 0 ? (
                            <table className="pegawai-table">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pegawaiList.map(pegawai => (
                                        <tr key={pegawai.id}>
                                            <td>{pegawai.nama}</td>
                                            <td>{pegawai.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="empty-list-message">Belum ada data pegawai.</p>
                        )}
                    </div>
                </div>
                 {/* --- END OF ORIGINAL PAGE CONTENT --- */}

            </div>
        </div>
    );
};

export default ManagePegawai;