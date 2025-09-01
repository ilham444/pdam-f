// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { FaUser, FaUserCheck, FaUserTimes, FaChevronRight } from 'react-icons/fa'; // <-- IMPORT BARU
import api from '../api';
import { useNavigate, Link } from 'react-router-dom'; // <-- IMPORT BARU: Link
import HeatmapComponent from '../components/HeatmapComponent';

const Dashboard = () => {
    const navigate = useNavigate();

    // State dan useEffect Anda sudah benar, tidak ada perubahan di sini
    const [stats, setStats] = useState({
        totalPelanggan: 0,
        pelangganAktif: 0,
        pelangganTidakAktif: 0,
        pelangganTerbaru: [],
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get('/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                setError('Gagal memuat data dashboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    
    // Fungsi ini tidak lagi kita gunakan untuk list, tapi bisa disimpan untuk keperluan lain
    // const handlePelangganClick = (pelanggan) => {
    //     navigate('/peta', { state: { flyToId: pelanggan.id } });
    // };

    const StatCardSkeleton = () => (
        <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-28"></div>
    );
    
    return (
        <div className="bg-gray-100 min-h-screen"> 
            <div className="pt-24 px-4 sm:px-8 pb-8">
                <Navbar />
                <h1 className="text-3xl font-bold mt-16 mb-6 text-gray-800">Dashboard</h1>
                
                {/* --- Kartu Statistik (tidak berubah) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* ... kode kartu statistik Anda ... */}
                </div>

                {/* --- Peta dan Daftar Pelanggan --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Peta (tidak berubah) */}
                    <div className="lg:col-span-2 w-full max-h-fit rounded-xl bg-white shadow-lg border border-gray-200">
                        <HeatmapComponent />
                    </div>

                    {/* --- BAGIAN YANG DIPERBAIKI --- */}
                    <div className="w-full rounded-xl bg-white shadow-lg p-6 flex flex-col max-h-fit">
                        <h2 className="font-bold text-xl mb-4 text-gray-800">Pelanggan Terbaru</h2>
                        <div className="flex-grow overflow-y-auto -mr-4 pr-4"> 
                            {loading ? (
                                <p className="text-gray-500">Memuat data...</p>
                            ) : (
                                stats.pelangganTerbaru && stats.pelangganTerbaru.length > 0 ? (
                                    stats.pelangganTerbaru.map(pelanggan => (
                                        <Link 
                                            key={pelanggan.id} 
                                            // Mengarahkan ke halaman detail pelanggan dengan ID yang sesuai
                                            to={`/daftar-pelanggan/detail-pelanggan/${pelanggan.id}`}
                                            className="block p-4 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-gray-800 truncate">{pelanggan.nama_pelanggan}</p>
                                                    <p className="text-sm text-gray-500 truncate">{pelanggan.id_pelanggan} - {pelanggan.alamat}</p>
                                                </div>
                                                <FaChevronRight className="text-gray-400 flex-shrink-0 ml-2" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center mt-8">Belum ada data pelanggan.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;