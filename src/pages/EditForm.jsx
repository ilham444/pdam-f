// src/pages/EditForm.jsx

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { FaFloppyDisk } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import api from '../api';

const EditForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id_pelanggan: '',
        nama_pelanggan: '',
        no_telpon: '',
        alamat: '',
        jumlah_jiwa: '',
        jenis_meter: '',
        tanggal_pemasangan: '',
        longitude: '',
        latitude: '',
        foto_rumah_url: '',
        status: '', 
    });

    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [newFile, setNewFile] = useState(null);

    useEffect(() => {
        const fetchPelangganData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await api.get(`/pelanggan/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // Data pelanggan sudah difilter berdasarkan id_pegawai di backend (pelangganController.js)
                if (response.data.tanggal_pemasangan) {
                    response.data.tanggal_pemasangan = new Date(response.data.tanggal_pemasangan).toISOString().split('T')[0];
                }
                setFormData(response.data);
            } catch (error) {
                console.error('Error Fetching Data: ', error);
                if (error.response && error.response.status === 401) {
                    alert('Sesi Anda telah berakhir. Silakan login kembali.');
                    localStorage.clear();
                    navigate('/login');
                } else {
                    alert('Gagal memuat data pelanggan.');
                    navigate('/daftar-pelanggan');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPelangganData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setNewFile(e.target.files[0]);
        }
    };

    const handleLocationSelect = (location) => {
        setFormData(prevData => ({ ...prevData, latitude: location.latitude, longitude: location.longitude, alamat: location.alamat }));
    };

    const handleAddressSearch = async () => {
        if (!formData.alamat) return alert('Silakan masukkan alamat terlebih dahulu.');
        setIsSearching(true);
        try {
            const query = encodeURIComponent(formData.alamat);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
                {
                    headers: {
                        'User-Agent': 'PDAM Tirta Intan Mapping App/1.0 (contact@example.com)'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Nominatim API returned with status: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setFormData(prevData => ({ ...prevData, latitude: parseFloat(lat), longitude: parseFloat(lon), alamat: display_name }));
            } else {
                alert('Alamat tidak ditemukan.');
            }
        } catch (error) {
            alert('Terjadi kesalahan saat mencari alamat: ' + error.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'foto_rumah_url') {
                data.append(key, formData[key]);
            }
        });
        
        if (newFile) {
            data.append('foto_rumah', newFile);
        }

        try {
            const token = localStorage.getItem('token');
            await api.put(`/pelanggan/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });
            alert('Data pelanggan berhasil diperbarui!');
            // --- PERBAIKAN: Arahkan kembali ke halaman detail ---
            navigate(`/daftar-pelanggan/detail-pelanggan/${id}`);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                localStorage.clear();
                navigate('/login');
            } else {
                const errorMessage = error.response?.data?.message || error.message;
                alert('Error memperbarui data: ' + errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-200 pt-24 px-8 sm:px-16">
            <Navbar />
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">Edit Data Pelanggan</h1>
                {loading && !formData.id_pelanggan ? <p>Memuat data...</p> : (
                    <form onSubmit={handleUpdate} className="flex flex-col justify-center w-full">
                        <div className="sm:flex gap-4 mb-4">
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>No. ID Pelanggan</h1>
                                    <input type="text" name="id_pelanggan" value={formData.id_pelanggan || ''} onChange={handleChange} className='border w-full border-gray-300 bg-gray-100 px-4 py-2 rounded-lg' readOnly />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Nama Pelanggan</h1>
                                    <input type="text" name="nama_pelanggan" value={formData.nama_pelanggan || ''} onChange={handleChange} className='border w-full border-blue-400 px-4 py-2 rounded-lg' required />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>No. Telpon</h1>
                                    <input type="text" name="no_telpon" value={formData.no_telpon || ''} onChange={handleChange} className='border w-full border-blue-400 px-4 py-2 rounded-lg' required />
                                </div>
                            </div>
                            
                            <MapPicker onLocationSelect={handleLocationSelect} latitude={formData.latitude} longitude={formData.longitude} />
                            
                            <h1 className='mb-2'>Alamat</h1>
                            <div className="flex items-start gap-2 mb-4">
                                <textarea name="alamat" value={formData.alamat || ''} onChange={handleChange} placeholder='Ketik alamat lalu, klik cari alamat' className='border w-full border-blue-400 px-4 py-2 rounded-lg h-24 shadow-md' required></textarea>
                                <button type="button" onClick={handleAddressSearch} disabled={isSearching} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md h-24 disabled:bg-gray-400">
                                    {isSearching ? 'Mencari...' : 'Cari Alamat'}
                                </button>
                            </div>

                            <div className="sm:flex gap-4 mb-4">
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Jumlah Jiwa</h1>
                                    <input type="number" name="jumlah_jiwa" value={formData.jumlah_jiwa || ''} onChange={handleChange} className='border w-full border-blue-400 px-4 py-2 rounded-lg' required />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Jenis Meter Air</h1>
                                    <input type="text" name="jenis_meter" value={formData.jenis_meter || ''} onChange={handleChange} className='border w-full border-blue-400 px-4 py-2 rounded-lg' required />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Tanggal Pemasangan</h1>
                                    <input type="date" name="tanggal_pemasangan" value={formData.tanggal_pemasangan || ''} onChange={handleChange} className='border w-full border-blue-400 px-4 py-2 rounded-lg' required />
                                </div>
                            </div>
                            
                            <div className="mb-4 shadow-md">
                                <h1 className='mb-2'>Status</h1>
                                <select 
                                    name="status" 
                                    value={formData.status || ''}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg bg-white'
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">Tidak Aktif</option>
                                </select>
                            </div>

                            <h1 className="mb-2">Lokasi Pemasangan (Otomatis Terisi)</h1>
                            <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>longitude</h1>
                                    <input type="number" step='any' name="longitude" value={formData.longitude || ''} onChange={handleChange} className='border w-full border-gray-300 bg-gray-100 px-4 py-2 rounded-lg' readOnly required />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Latitude</h1>
                                    <input type="number" step='any' name="latitude" value={formData.latitude || ''} onChange={handleChange} className='border w-full border-gray-300 bg-gray-100 px-4 py-2 rounded-lg' readOnly required />
                                </div>
                            </div>

                            <div className="w-full mb-8">
                                <h1 className="mb-2 font-semibold">Foto Rumah</h1>
                                <div className="p-4 border border-gray-200 shadow-sm rounded-lg">
                                    <h2 className="mb-2 text-sm text-gray-600">Foto Saat Ini:</h2>
                                    {formData.foto_rumah_url ? (<img src={formData.foto_rumah_url} alt="Foto Rumah Pelanggan" className="w-40 h-40 object-cover rounded-md mb-4" />) : (<p className="text-gray-500 mb-4">Tidak ada foto.</p>)}
                                    <h2 className="mb-2 text-sm text-gray-600">Ganti Foto (Opsional):</h2>
                                    <div className="flex items-center gap-4 border rounded-lg border-blue-400">
                                        <input type="file" name="file" id="file" className='hidden' onChange={handleFileChange} accept="image/*" />
                                        <label htmlFor="file" className='cursor-pointer bg-blue-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-500 transition text-xs sm:text-base'>Pilih File Baru</label>
                                        <span className="text-gray-500 text-xs sm:text-base">{newFile ? newFile.name : 'Belum ada file baru yang dipilih'}</span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className='w-full bg-yellow-500 hover:bg-yellow-600 font-bold py-2 px-4 text-white flex justify-center items-center gap-2 rounded-lg cursor-pointer disabled:bg-gray-400'>
                                <FaFloppyDisk /> <span>{loading ? 'Menyimpan...' : 'Update Data'}</span>
                            </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditForm;