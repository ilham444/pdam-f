// src/components/MapPicker.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

function ChangeMapView({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView(coords, 18);
        }
    }, [coords, map]);
    return null;
}

function LocationMarker({ position, onLocationSelect }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationSelect({ lat, lng });
        },
    });
    return position === null ? null : <Marker position={position}></Marker>;
}

const MapPicker = ({ onLocationSelect, latitude, longitude }) => {
    const initialPosition = [latitude || -7.2278, longitude || 107.9087];
    const [position, setPosition] = useState(initialPosition);

    useEffect(() => {
        if (latitude && longitude) {
            setPosition([latitude, longitude]);
        }
    }, [latitude, longitude]);

    const handleLocationSelect = async (coords) => {
        setPosition([coords.lat, coords.lng]);
        try {
            // Tambahkan delay 1 detik untuk menghindari rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
                {
                    headers: {
                        'User-Agent': 'PDAM Tirta Intan Mapping App/1.0 (tirta.intan@example.com)',
                        'Accept-Language': 'id,en;q=0.9'
                    }
                }
            );
            
            if (!response.ok) throw new Error(`Nominatim API error: ${response.status}`);
            const data = await response.json();
            onLocationSelect({
                latitude: coords.lat,
                longitude: coords.lng,
                alamat: data.display_name || 'Alamat tidak ditemukan',
            });
        } catch (error) {
            console.error("Error fetching address from Nominatim: ", error);
            onLocationSelect({
                latitude: coords.lat,
                longitude: coords.lng,
                alamat: 'Gagal mendapatkan alamat dari peta',
            });
        }
    }
    
    return (
        <div className="mb-4 z-10">
            <p className="text-sm text-gray-600 mb-2">Klik pada peta untuk memilih lokasi pelanggan:</p>
            <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }} className="rounded-lg shadow-md">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
                <ChangeMapView coords={position} />
            </MapContainer>
        </div>
    );
}

export default MapPicker;