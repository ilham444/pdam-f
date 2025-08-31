// src/components/HeatmapComponent.jsx

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
// --- INI BARIS YANG DIPERBAIKI ---
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
// ------------------------------------
import { FaInfoCircle } from 'react-icons/fa';
import api from '../api';

// Komponen FitBounds (tidak berubah)
function FitBounds({ points }) { /* ... */ }

// Fungsi getTopDenseAreas (tidak berubah)
const getTopDenseAreas = (pelanggan, topN = 3) => { /* ... */ };

const HeatmapComponent = () => {
    // Semua state dan logic di sini tidak berubah
    const [pelanggan, setPelanggan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPelangganData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get('/pelanggan', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Filter data berdasarkan koordinat yang valid
                const validPelanggan = response.data.filter(p => p.latitude && p.longitude);
                setPelanggan(validPelanggan);
            } catch (err) {
                console.error("Gagal memuat data untuk heatmap:", err);
                setError("Tidak dapat memuat data peta.");
            } finally {
                setLoading(false);
            }
        };

        fetchPelangganData();
    }, []);
    
    // Catatan: Tidak perlu filter tambahan di sini karena data sudah difilter
    // berdasarkan id_pegawai di backend (pelangganController.js)

    // ... sisa kode (if loading, if error) tidak berubah ...

    const denseAreas = getTopDenseAreas(pelanggan);

    // JSX return juga tidak berubah
   return (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* Kotak Statistik Peta bisa ditempatkan di sini */}
    <MapContainer
      style={{ width: '100%', height: '500px' }} // ✅ kasih tinggi supaya peta kelihatan
      center={[-7.2, 107.9]} // contoh koordinat default (Garut), bisa diganti
      zoom={12}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      <HeatmapLayer
        points={pelanggan}
        longitudeExtractor={p => p.longitude}
        latitudeExtractor={p => p.latitude}
        intensityExtractor={() => 1}
      />
      <FitBounds points={pelanggan} />
    </MapContainer>
  </div>
);

};


export default HeatmapComponent;