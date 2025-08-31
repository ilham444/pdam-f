// src/pages/Form.jsx

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { FaFloppyDisk } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import api from '../api'; 

const Form = () => {
    const [formData, setFormData] = useState({
        nama_pelanggan: '',
        no_telpon: '',
        alamat: '',
        jumlah_jiwa: '',
        jenis_meter: '',
        tanggal_pemasangan: '',
        longitude: '',
        latitude: '',
        status: 'Aktif', // <-- TAMBAHKAN: Nilai default untuk status
    });

    const [isSearching, setIsSearching] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Silakan pilih file foto rumah terlebih dahulu.');
            return;
        }

        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        data.append('foto_rumah', file);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                navigate('/login');
                return;
            }

            const response = await api.post('/pelanggan', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` // Pastikan token dikirim
                },
            });

            console.log('Response:', response.data);
            alert('Data Berhasil Disimpan!');
            
            setFormData({
                nama_pelanggan: '',
                no_telpon: '',
                alamat: '',
                jumlah_jiwa: '',
                jenis_meter: '',
                tanggal_pemasangan: '',
                longitude: '',
                latitude: '',
                status: 'Aktif', // <-- TAMBAHKAN: Reset status ke default
            });
            setFile(null);
            if (document.getElementById('file')) {
                document.getElementById('file').value = '';
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            
            if (error.response) {
                if (error.response.status === 401) {
                    alert('Sesi Anda telah berakhir. Silakan login kembali.');
                    navigate('/login');
                    return;
                }
                const errorMessage = error.response.data?.message || 'Terjadi kesalahan pada server';
                alert('Error: ' + errorMessage);
            } else if (error.request) {
                alert('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
            } else {
                alert('Error: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        setFormData(prevData => ({
            ...prevData,
            latitude: location.latitude,
            longitude: location.longitude,
            alamat: location.alamat
        }));
    };

    const handleAddressSearch = async () => {
        if (!formData.alamat) {
            alert('Silakan masukkan alamat terlebih dahulu.');
            return;
        }
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
                setFormData(prevData => ({
                    ...prevData,
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon),
                    alamat: display_name,
                }));
            } else {
                alert('Alamat tidak ditemukan. Coba gunakan kata kunci yang lebih spesifik.');
            }
        } catch (error) {
            console.error('Gagal mencari alamat:', error);
            alert('Terjadi kesalahan saat mencari alamat.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="bg-gray-200 pt-24 px-8 sm:px-16">
            <Navbar />

            <div className="pt-16 pb-8">
                <h1 className="font-semibold text-2xl">Input Data Pelanggan Baru</h1>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-lg">
                <form onSubmit={handleSubmit} className="flex flex-col justify-center w-full">
                     <div className="sm:flex gap-4 mb-4">
                        <div className="w-full shadow-md">
                            <h1 className='mb-2'>Nama Pelanggan</h1>
                            <input
                                type="text"
                                name="nama_pelanggan"
                                value={formData.nama_pelanggan}
                                onChange={handleChange}
                                className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                placeholder='Nama'
                                required
                            />
                        </div>
                        <div className="w-full shadow-md">
                            <h1 className='mb-2'>No. Telpon</h1>
                            <input
                                type="text"
                                name="no_telpon"
                                value={formData.no_telpon}
                                onChange={handleChange}
                                className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                placeholder='08xxxxxxxxxx'
                                required
                            />
                        </div>
                    </div>
                    <MapPicker
                        onLocationSelect={handleLocationSelect}
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                    />
                    <h1 className='mb-2'>Alamat</h1>
                    <textarea
                        name="alamat"
                        id="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        placeholder='Ketik alamat lalu, klik cari alamat'
                        className='border w-full border-blue-400 px-4 py-2 rounded-lg h-40 shadow-md mb-4'
                        required
                    ></textarea>
                    <button
                        type="button"
                        onClick={handleAddressSearch}
                        disabled={isSearching}
                        className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 mb-8 px-4 rounded-lg shadow-md disabled:bg-gray-400"
                    >
                        {isSearching ? 'Mencari...' : 'Cari Alamat'}
                    </button>
                    <div className="sm:flex gap-4 mb-4">
                        <div className="w-full shadow-md">
                            <h1 className='mb-2'>Jumlah Jiwa</h1>
                            <input
                                type="number"
                                name="jumlah_jiwa"
                                value={formData.jumlah_jiwa}
                                onChange={handleChange}
                                className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                placeholder=''
                                required />
                        </div>
                        <div className="w-full shadow-md">
                            <h1 className='mb-2'>Jenis Meter Air</h1>
                            <input
                                type="text"
                                name="jenis_meter"
                                value={formData.jenis_meter}
                                onChange={handleChange}
                                className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                placeholder=''
                                required
                            />
                        </div>
                        <div className="w-full shadow-md">
                            <h1 className='mb-2'>Tanggal Pemasangan</h1>
                            <input
                                type="date"
                                name="tanggal_pemasangan"
                                value={formData.tanggal_pemasangan}
                                onChange={handleChange}
                                className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                required
                            />
                        </div>
                    </div>
                    {/* --- TAMBAHKAN BLOK INI --- */}
                    <div className="mb-4 shadow-md">
                        <h1 className='mb-2'>Status</h1>
                        <select 
                            name="status" 
                            value={formData.status}
                            onChange={handleChange}
                            className='border w-full border-blue-400 px-4 py-2 rounded-lg bg-white'
                        >
                            <option value="Aktif">Aktif</option>
                            <option value="Tidak Aktif">Tidak Aktif</option>
                        </select>
                    </div>
                    {/* --------------------------- */}
                    <h1 className="mb-2">Lokasi Pemasangan</h1>
                    <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                        <div className="w-full shadow-md">
                            <h1 className='mb-2'>longitude</h1>
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                placeholder=''
                                readOnly
                                required
                            />
                        </div>
                        <div className="w-full shadow-md">
                            <h1 className='mb-2'>Latitude</h1>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                placeholder=''
                                readOnly
                                required
                            />
                        </div>
                    </div>
                    <div className="w-full mb-8">
                        <h1 className="mb-2">Foto Rumah</h1>
                        <div className="flex items-center gap-4 border rounded-lg border-blue-400">
                            <input
                                type="file"
                                id="file"
                                className='hidden'
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                            <label htmlFor="file" className='cursor-pointer bg-blue-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-500 transition text-xs sm:text-base'>
                                Pilih File
                            </label>
                            <span id="file-name" className="text-gray-500 text-xs sm:text-base">
                                {file ? file.name : 'Belum ada file yang dipilih'}
                            </span>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className='w-full bg-blue-400 font-bold py-2 text-white flex justify-center items-center gap-2 rounded-lg cursor-pointer disabled:bg-gray-500'>
                        <FaFloppyDisk /> <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Form;