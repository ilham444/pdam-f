import React, { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { FaUser, FaHome, FaPhone, FaCalendarAlt } from 'react-icons/fa';

// Buat custom icon berdasarkan status pelanggan
const createCustomIcon = (status) => {
    // Warna berdasarkan status pelanggan (aktif/tidak aktif)
    const iconColor = status === 'aktif' ? '#38A169' : // hijau untuk aktif
                     status === 'tidak_aktif' ? '#E53E3E' : // merah untuk tidak aktif
                     '#3182CE'; // biru sebagai default

    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                background-color: ${iconColor};
                width: 30px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                color: white;
                font-size: 14px;
                font-weight: bold;
            ">
                <span>P</span>
            </div>
            <div style="
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid ${iconColor};
            "></div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -45]
    });
};

const CustomerMarker = ({ pelanggan, isSelected, onClick }) => {
    const markerRef = useRef(null);
    
    // Tentukan status pelanggan (jika tidak ada, gunakan 'default')
    const status = pelanggan.status || 'default';
    
    // Buat ikon kustom berdasarkan status
    const icon = createCustomIcon(status);

    useEffect(() => {
        if (isSelected && markerRef.current) {
            setTimeout(() => {
                markerRef.current.openPopup();
            }, 100);
        }
    }, [isSelected]);
    
    // Format tanggal pemasangan
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <Marker
            ref={markerRef}
            position={[pelanggan.latitude, pelanggan.longitude]}
            icon={icon}
            eventHandlers={{
                click: () => {
                    // Saat marker ini diklik, panggil fungsi dari parent
                    onClick(pelanggan);
                },
            }}
        >
            <Popup className="custom-popup" maxWidth="300">
                <div className="font-sans p-1">
                    {/* Header dengan status */}
                    <div className={`rounded-t-lg p-2 mb-2 text-white ${status === 'aktif' ? 'bg-green-500' : status === 'tidak_aktif' ? 'bg-red-500' : 'bg-blue-500'}`}>
                        <h3 className="font-bold text-base">{pelanggan.nama_pelanggan}</h3>
                        <p className="text-xs opacity-90">ID: {pelanggan.id_pelanggan}</p>
                    </div>
                    
                    {/* Informasi pelanggan dengan ikon */}
                    <div className="space-y-2 mb-3">
                        <div className="flex items-start">
                            <FaUser className="text-gray-500 mt-1 mr-2" />
                            <div>
                                <p className="text-xs text-gray-500">Nama Pelanggan</p>
                                <p className="text-sm font-medium">{pelanggan.nama_pelanggan}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <FaHome className="text-gray-500 mt-1 mr-2" />
                            <div>
                                <p className="text-xs text-gray-500">Alamat</p>
                                <p className="text-sm">{pelanggan.alamat}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <FaPhone className="text-gray-500 mt-1 mr-2" />
                            <div>
                                <p className="text-xs text-gray-500">Telepon</p>
                                <p className="text-sm">{pelanggan.no_telpon || '-'}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <FaCalendarAlt className="text-gray-500 mt-1 mr-2" />
                            <div>
                                <p className="text-xs text-gray-500">Tanggal Pemasangan</p>
                                <p className="text-sm">{formatDate(pelanggan.tanggal_pemasangan)}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tombol aksi */}
                    <div className="flex space-x-2 mt-2">
                        <Link to={`/daftar-pelanggan/detail-pelanggan/${pelanggan.id}`} className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded-md text-sm transition-colors">
                            Lihat Detail
                        </Link>
                        <Link to={`/daftar-pelanggan/edit-pelanggan/${pelanggan.id}`} className="flex-1 text-center bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded-md text-sm transition-colors">
                            Edit Data
                        </Link>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

export default CustomerMarker;