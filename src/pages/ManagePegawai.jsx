// src/pages/ManagePegawai.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';

const ManagePegawai = () => {
    // All your existing state and logic is correct
    const [pegawaiList, setPegawaiList] = useState([]);
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: ''
    });
    const [editingPegawai, setEditingPegawai] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, pegawai: null });
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
            
            if (editingPegawai) {
                // Update existing pegawai
                console.log('Attempting to update pegawai with ID:', editingPegawai.id);
                console.log('Form data:', formData);
                
                await api.put(`/admin/pegawai/${editingPegawai.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess('Data pegawai berhasil diperbarui!');
                setEditingPegawai(null);
            } else {
                // Create new pegawai
                await api.post('/admin/create-pegawai', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess('Akun pegawai berhasil dibuat!');
            }
            
            setFormData({ nama: '', email: '', password: '' });
            fetchPegawai(); // Refresh list
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
        }
    };

    const handleEdit = (pegawai) => {
        setEditingPegawai(pegawai);
        setFormData({
            nama: pegawai.nama,
            email: pegawai.email,
            password: '' // Don't pre-fill password for security
        });
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        setEditingPegawai(null);
        setFormData({ nama: '', email: '', password: '' });
        setError('');
        setSuccess('');
    };

    const handleDelete = async (pegawai) => {
        setDeleteConfirm({ show: true, pegawai });
    };

    const confirmDelete = async () => {
        const pegawai = deleteConfirm.pegawai;
        if (!pegawai) return;

        try {
            const token = localStorage.getItem('token');
            console.log('Attempting to delete pegawai with ID:', pegawai.id);
            
            await api.delete(`/admin/pegawai/${pegawai.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Pegawai dan data terkait berhasil dihapus!');
            setDeleteConfirm({ show: false, pegawai: null });
            fetchPegawai(); // Refresh list
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat menghapus pegawai');
            setDeleteConfirm({ show: false, pegawai: null });
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ show: false, pegawai: null });
    };

    const fixDatabase = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.post('/admin/debug/fix-database', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Database structure fixed: ' + response.data.message);
            fetchPegawai(); // Refresh list to get updated counts
        } catch (err) {
            console.error('Fix database error:', err);
            setError('Error fixing database: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        // Structure with Navbar
        <div className="bg-gray-50 min-h-screen pt-24"> 
            <Navbar />
            <div className="pt-16 px-4 sm:px-8 pb-8">
                
                {/* --- ALL YOUR ORIGINAL PAGE CONTENT GOES HERE --- */}
                {/* I have added the 'mt-16' class to the h1 to give it space from the fixed navbar */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2">Manajemen Akun Pegawai</h1>
                        {/* <button
                            onClick={fixDatabase}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors duration-200"
                        >
                            Fix Database
                        </button> */}
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">
                            {editingPegawai ? 'Edit Pegawai' : 'Buat Akun Baru'}
                        </h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <label htmlFor="nama" className="mb-2 font-medium text-gray-700">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        id="nama" 
                                        name="nama" 
                                        value={formData.nama} 
                                        onChange={handleChange} 
                                        placeholder="cth: Budi Santoso" 
                                        required 
                                        className="px-3 py-2 border border-gray-300 rounded-md text-base transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="email" className="mb-2 font-medium text-gray-700">Email (untuk login)</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        placeholder="cth: budi@pdam.com" 
                                        required 
                                        className="px-3 py-2 border border-gray-300 rounded-md text-base transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="password" className="mb-2 font-medium text-gray-700">
                                        Password {editingPegawai && <span className="text-sm text-gray-500">(kosongkan jika tidak ingin mengubah)</span>}
                                    </label>
                                    <input 
                                        type="password" 
                                        id="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        placeholder={editingPegawai ? "Kosongkan jika tidak ingin mengubah" : "Min. 6 karakter"} 
                                        required={!editingPegawai}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-base transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-start">
                                <button 
                                    type="submit" 
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold border-none rounded-md cursor-pointer transition-colors duration-200 hover:bg-blue-700"
                                >
                                    {editingPegawai ? 'Update' : 'Buat Akun'}
                                </button>
                                {editingPegawai && (
                                    <button 
                                        type="button" 
                                        onClick={handleCancelEdit}
                                        className="px-6 py-2 bg-gray-500 text-white font-semibold border-none rounded-md cursor-pointer transition-colors duration-200 hover:bg-gray-600"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                        {error && <p className="p-4 rounded-md mt-4 text-center bg-red-100 text-red-700 border border-red-200">{error}</p>}
                        {success && <p className="p-4 rounded-md mt-4 text-center bg-green-100 text-green-700 border border-green-300">{success}</p>}
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Daftar Pegawai</h3>
                        <div className="overflow-x-auto">
                            {isLoading ? (
                                <p className="text-center py-8 text-gray-500 italic">Memuat data...</p>
                            ) : pegawaiList.length > 0 ? (
                                <table className="w-full border-collapse mt-4">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 uppercase text-xs">Nama</th>
                                            <th className="px-4 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 uppercase text-xs">Email</th>
                                            <th className="px-4 py-3 text-center border-b border-gray-200 font-semibold text-gray-700 uppercase text-xs">Pelanggan</th>
                                            <th className="px-4 py-3 text-center border-b border-gray-200 font-semibold text-gray-700 uppercase text-xs">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pegawaiList.map(pegawai => (
                                            <tr key={pegawai.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-4 py-3 text-left border-b border-gray-200">{pegawai.nama}</td>
                                                <td className="px-4 py-3 text-left border-b border-gray-200">{pegawai.email}</td>
                                                <td className="px-4 py-3 text-center border-b border-gray-200">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                        pegawai.jumlah_pelanggan > 0 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {pegawai.jumlah_pelanggan} pelanggan
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center border-b border-gray-200">
                                                    <div className="flex justify-center gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => handleEdit(pegawai)}
                                                            className="px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded hover:bg-amber-600 transition-colors duration-200"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(pegawai)}
                                                            className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition-colors duration-200"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center py-8 text-gray-500 italic">Belum ada data pegawai.</p>
                            )}
                        </div>
                    </div>
                </div>
                 {/* --- END OF ORIGINAL PAGE CONTENT --- */}

                {/* Modal Konfirmasi Delete */}
                {deleteConfirm.show && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Konfirmasi Penghapusan</h3>
                            <p className="text-gray-700 mb-4">
                                Apakah Anda yakin ingin menghapus pegawai <strong>"{deleteConfirm.pegawai?.nama}"</strong>?
                            </p>
                            {deleteConfirm.pegawai?.jumlah_pelanggan > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                                    <p className="text-red-800 font-semibold flex items-center">
                                        <span className="text-red-600 mr-2">⚠️</span>
                                        PERINGATAN
                                    </p>
                                    <p className="text-red-700 mt-2">
                                        <strong>{deleteConfirm.pegawai.jumlah_pelanggan} pelanggan</strong> yang terkait dengan pegawai ini juga akan ikut terhapus!
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ManagePegawai;