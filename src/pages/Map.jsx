import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- IMPORT BARU
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';

import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { FaSearch, FaTimes } from 'react-icons/fa'
import CustomerMarker from '../components/CustomMarker';
import api from '../api'; // <-- Ganti fetch dengan api client

function FitBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0 && map) {
            map.fitBounds(points, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
}

function FlyToLocation({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 17, {
                animate: true,
                duration: 1.5,
            });
        }
    }, [position, map]);
    return null;
}

const Map = () => {
    const [pelangganList, setPelangganList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [flyToPosition, setFlyToPosition] = useState(null);
    const [selectedPelanggan, setSelectedPelanggan] = useState(null);
    const navigate = useNavigate(); // <-- Tambahkan hook navigate

    const fetchAllPelanggan = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/pelanggan', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Data pelanggan sudah difilter berdasarkan id_pegawai di backend (pelangganController.js)
            setPelangganList(response.data);
        } catch (error) {
            console.error('Gagal mengambil data pelanggan:', error);
            if (error.response && error.response.status === 401) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                localStorage.clear();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAllPelanggan();
    }, [fetchAllPelanggan]);

    const handleSearch = async () => {
        if (!searchId.trim()) {
            alert('Silakan masukkan ID Pelanggan untuk dicari.');
            return;
        }
        setIsSearching(true);
        setFlyToPosition(null);

        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/pelanggan`, {
                params: { id_pelanggan: searchId.trim() },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = response.data;
            if (data && data.length > 0) {
                const pelanggan = data[0];
                setSelectedPelanggan(pelanggan);
                if (pelanggan.latitude && pelanggan.longitude) {
                    setFlyToPosition([pelanggan.latitude, pelanggan.longitude]);
                } else {
                    alert('Pelanggan ditemukan, tetapi tidak memiliki data lokasi di peta.');
                }
            } else {
                alert('Pelanggan dengan ID tersebut tidak ditemukan.');
            }
        } catch (error) {
            console.error('Search error:', error);
            if (error.response && error.response.status === 401) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                localStorage.clear();
                navigate('/login');
            } else {
                alert('Terjadi kesalahan saat mencari pelanggan.');
            }
        } finally {
            setIsSearching(false);
        }
    };

    const locations = pelangganList
        .filter(p => p.latitude && p.longitude)
        .map(p => [p.latitude, p.longitude]);

    const handleMarkerClick = (pelanggan) => {
        setSelectedPelanggan(pelanggan);
        if (pelanggan.latitude && pelanggan.longitude) {
            setFlyToPosition([pelanggan.latitude, pelanggan.longitude]);
        }
    };

    return (
        <>
            <div className="bg-gray-200 pt-24 pb-10 px-4 sm:px-16">
                <Navbar />
                <div className="my-10 p-8">
                    <h1 className="text-2xl font-medium mb-4">Peta Sebaran Pelanggan</h1>
                    <div className='flex shadow-md mb-8'>
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder='Cari berdasarkan ID Pelanggan..'
                            className='w-full py-2 px-4 rounded-l-xl border border-gray-300 bg-white'
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className='px-4 py-2 border rounded-r-xl border-gray-300 bg-blue-200'
                        >
                            <FaSearch />
                        </button>
                    </div>

                    <div className="lg:flex gap-8 z-10">
                        {loading ? (
                            <p>Memuat data peta...</p>
                        ) : (
                            <div className="w-full h-[60vh] rounded-lg overflow-hidden my-4 z-10 border border-gray-400 shadow-lg">
                                <MapContainer
                                    center={[-7.2278, 107.9087]}
                                    zoom={10}
                                    style={{ height: '100%', width: '100%', zIndex: '10', }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        className='z-10'
                                    />
                                    {pelangganList.map(pelanggan => (
                                        pelanggan.latitude && pelanggan.longitude && (
                                            <CustomerMarker
                                                key={pelanggan.id}
                                                pelanggan={pelanggan}
                                                isSelected={selectedPelanggan?.id === pelanggan.id}
                                                onClick={handleMarkerClick}
                                            />
                                        )
                                    ))}
                                    {!flyToPosition && locations.length > 0 && <FitBounds points={locations} />}
                                    {flyToPosition && <FlyToLocation position={flyToPosition} />}
                                </MapContainer>
                            </div>
                        )}

                        <div className="rounded-lg lg:w-2/5 border p-4 bg-white border-gray-300 shadow-lg my-4">
                            {selectedPelanggan ? (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-gray-800">Rincian Pelanggan</h2>
                                        <button onClick={() => setSelectedPelanggan(null)} className="p-1 rounded-full hover:bg-gray-200">
                                            <FaTimes className="text-gray-500" />
                                        </button>
                                    </div>
                                    <img src={selectedPelanggan.foto_rumah_url || '/image-break.png'} alt="Foto Rumah" className="w-full h-48 object-cover rounded-md mb-4" />
                                    <div className="space-y-2 text-sm">
                                        <p><strong>ID Pelanggan:</strong> <span className="text-blue-600 font-semibold">{selectedPelanggan.id_pelanggan}</span></p>
                                        <p><strong>Nama:</strong> {selectedPelanggan.nama_pelanggan}</p>
                                        <p><strong>No. Telepon:</strong> {selectedPelanggan.no_telpon}</p>
                                        <p><strong>Alamat:</strong> {selectedPelanggan.alamat}</p>
                                        <p><strong>Tanggal Pasang:</strong> {new Date(selectedPelanggan.tanggal_pemasangan).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <Link to={`/daftar-pelanggan/edit-pelanggan/${selectedPelanggan.id}`} className="mt-4 block w-full text-center bg-yellow-500 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-600">
                                        Edit Detail Pelanggan
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                    <img src="./select-on-map.svg" alt="Pilih di Peta" className="w-32 h-32 mb-4" />
                                    <h3 className="text-lg font-semibold">Belum Ada Pelanggan Terpilih</h3>
                                    <p>Klik salah satu pin di peta untuk melihat rinciannya di sini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Map