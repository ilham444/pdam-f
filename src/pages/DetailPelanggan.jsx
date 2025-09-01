// src/pages/DetailPelanggan.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const DetailPelanggan = () => {
    const { id } = useParams();
    const [pelanggan, setPelanggan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPelangganDetail = async () => {
            if (!id) return;
            setLoading(true); // <-- Tampilkan loading setiap kali ID berubah
            try {
                const token = localStorage.getItem('token');
                const response = await api.get(`/pelanggan/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // Data pelanggan sudah difilter berdasarkan id_pegawai di backend (pelangganController.js)
                setPelanggan(response.data);
            } catch (err) {
                setError('Gagal memuat data pelanggan.');
            } finally {
                setLoading(false);
            }
        };
        fetchPelangganDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen">
                <Navbar />
                <div className="pt-32 text-center">Memuat data pelanggan...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100 min-h-screen">
                <Navbar />
                <main className="pt-32 px-4 sm:px-8 pb-8">
                    <div className="text-center bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-red-500">{error}</h2>
                        <Link to="/daftar-pelanggan" className="mt-4 inline-block text-blue-600 hover:underline">
                            &larr; Kembali ke Daftar
                        </Link>
                    </div>
                </main>
            </div>
        );
    }
    
    if (!pelanggan) {
        return (
             <div className="bg-gray-100 min-h-screen">
                <Navbar />
                <main className="pt-32 px-4 sm:px-8 pb-8">
                    <div className="text-center bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-700">Pelanggan tidak ditemukan.</h2>
                        <Link to="/daftar-pelanggan" className="mt-4 inline-block text-blue-600 hover:underline">
                            &larr; Kembali ke Daftar
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const position = pelanggan.latitude && pelanggan.longitude 
        ? [parseFloat(pelanggan.latitude), parseFloat(pelanggan.longitude)] 
        : null;

    return (
        // --- PERBAIKAN STRUKTUR LAYOUT ---
        <div className="bg-gray-100 min-h-screen pt-32">
            <Navbar />
            <main className="pt-32 px-4 sm:px-8 pb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Detail Pelanggan</h1>
                    <Link to="/daftar-pelanggan" className="text-sm font-medium text-blue-600 hover:underline">
                        &larr; Kembali ke Daftar
                    </Link>
                </div>
                
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        <div className="flex flex-col gap-6">
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-sm font-semibold text-gray-500 mb-1">ID Pelanggan</h3>
                                <p className="text-lg text-blue-600 font-bold">{pelanggan.id_pelanggan}</p>
                            </div>
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-sm font-semibold text-gray-500 mb-1">Nama Pelanggan</h3>
                                <p className="text-lg text-gray-800">{pelanggan.nama_pelanggan}</p>
                            </div>
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-sm font-semibold text-gray-500 mb-1">Alamat</h3>
                                <p className="text-lg text-gray-800">{pelanggan.alamat}</p>
                            </div>
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-sm font-semibold text-gray-500 mb-1">No. Telepon</h3>
                                <p className="text-lg text-gray-800">{pelanggan.no_telpon || '-'}</p>
                            </div>
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-sm font-semibold text-gray-500 mb-1">Status</h3>
                                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${pelanggan.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {pelanggan.status || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                             <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-2">Lokasi di Peta</h3>
                                {position ? (
                                    <div className="h-72 w-full rounded-lg overflow-hidden border border-gray-200">
                                        <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%', zIndex: 0 }} scrollWheelZoom={false}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <Marker position={position}></Marker>
                                        </MapContainer>
                                    </div>
                                ) : (
                                    <div className="h-72 w-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-200 text-gray-500">
                                        Lokasi tidak tersedia
                                    </div>
                                )}
                            </div>
                             <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-2">Foto Rumah</h3>
                                <img 
                                    src={pelanggan.foto_rumah_url} 
                                    alt="Foto Rumah Pelanggan" 
                                    className="w-full h-auto max-h-96 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => { e.target.onerror = null; e.target.src='/image-break.png'; }}
                                />
                            </div>
                        </div>
                    </div>
                    <Link to={`/daftar-pelanggan/edit-pelanggan/${pelanggan.id}`} className="block w-full mt-6 py-3.5 px-4 text-center font-bold text-gray-700 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors duration-200">
                        Edit Pelanggan
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default DetailPelanggan;