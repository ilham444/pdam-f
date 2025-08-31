import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom'; // <-- IMPORT BARU
import api from '../api'; // pakai axios

const List = () => {
    const [allPelanggan, setAllPelanggan] = useState([]);
    const [filteredPelanggan, setFilteredPelanggan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); // <-- Tambahkan hook navigate

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token'); // Ambil token
            if (!token) {
                navigate('/login');
                return;
            }
            // --- BAGIAN YANG DIPERBAIKI: Tambahkan header Authorization ---
            const response = await api.get('/pelanggan', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Data pelanggan sudah difilter berdasarkan id_pegawai di backend (pelangganController.js)
            setAllPelanggan(response.data);
            setFilteredPelanggan(response.data);
        } catch (error) {
            console.error('Error Fetching Data: ', error);
            // --- BAGIAN YANG DIPERBAIKI: Tangani error 401 ---
            if (error.response && error.response.status === 401) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                localStorage.clear();
                navigate('/login');
            } else {
                alert('Gagal memuat data pelanggan.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]); // <-- Tambahkan dependensi navigate

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredPelanggan(allPelanggan);
        } else {
            const lowercasedFilter = searchTerm.toLowerCase();
            const filteredData = allPelanggan.filter(item =>
                (item.nama_pelanggan && item.nama_pelanggan.toLowerCase().includes(lowercasedFilter)) ||
                (item.id_pelanggan && item.id_pelanggan.toLowerCase().includes(lowercasedFilter))
            );
            setFilteredPelanggan(filteredData);
        }
    }, [searchTerm, allPelanggan]);

    const handleDelete = async (pelangganId) => {
        const isConfirm = window.confirm('Apakah anda yakin ingin menghapus pelanggan ini?');
        if (!isConfirm) return;

        try {
            const token = localStorage.getItem('token'); // Ambil token
            // --- BAGIAN YANG DIPERBAIKI: Tambahkan header Authorization ---
            await api.delete(`/pelanggan/${pelangganId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAllData(); 
            alert('Data Pelanggan Berhasil Dihapus!');
        } catch (error) {
            // --- BAGIAN YANG DIPERBAIKI: Tangani error 401 ---
            if (error.response && error.response.status === 401) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                localStorage.clear();
                navigate('/login');
            } else {
                alert('Error menghapus data: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    return (
        <div className="bg-gray-200 pt-20 pb-10 px-8 sm:px-16 min-h-screen">
            <Navbar />
            <div className="my-16">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Daftar Pelanggan</h1>
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="flex w-full justify-between items-center mb-6">
                        <div className="w-full lg:w-1/3 mt-4 sm:mt-0">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari ID atau Nama Pelanggan..."
                                className='w-full py-2 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500'
                            />
                        </div>
                    </div>

                    <div className="rounded-lg">
                        {loading ? (
                            <p className="text-center py-8 text-gray-500">Memuat data pelanggan...</p>
                        ) : (
                            filteredPelanggan.length > 0 ? (
                                filteredPelanggan.map((pelanggan) => (
                                    <div key={pelanggan.id} className="py-4 px-8 mb-4 rounded-lg border border-gray-200 shadow-lg sm:flex items-center gap-8 transition hover:shadow-xl">
                                        <img src={pelanggan.foto_rumah_url || './image-break.png'} alt="Foto Rumah" className='w-20 h-20 object-cover rounded-md mx-auto sm:mx-0' />
                                        <div className="flex-grow my-4 sm:my-0 text-center sm:text-left">
                                            <div className="flex gap-2 sm:gap-4 items-center mb-2 justify-center sm:justify-start">
                                                <h2 className='font-semibold text-lg sm:text-xl text-blue-600'>{pelanggan.id_pelanggan}</h2>
                                                <h2 className='font-medium text-gray-400'>|</h2>
                                                <h2 className='font-medium text-lg sm:text-xl text-gray-800'>{pelanggan.nama_pelanggan}</h2>
                                            </div>
                                            <h5 className='text-gray-600 text-sm'>{pelanggan.alamat}</h5>
                                        </div>
                                        <div className="flex justify-center sm:justify-end gap-3 mt-4 sm:mt-0">
                                            <Link to={`/daftar-pelanggan/detail-pelanggan/${pelanggan.id}`}>
                                                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md text-sm">
                                                    Lihat Detail
                                                </button>
                                            </Link>
                                            <Link to={`/daftar-pelanggan/edit-pelanggan/${pelanggan.id}`}>
                                                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md text-sm">
                                                    Update
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(pelanggan.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">Tidak ada data yang ditemukan.</p>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default List;