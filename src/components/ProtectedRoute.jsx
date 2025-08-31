// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');

    // 1. Cek Autentikasi: Apakah user sudah login? (ada token atau tidak)
    if (!token) {
        // Jika tidak ada token, paksa kembali ke halaman login.
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;

        // 2. Cek Autorisasi: Apakah role user diizinkan untuk mengakses halaman ini?
        //    - allowedRoles.includes(userRole) akan bernilai true jika role user ada di dalam daftar yang diizinkan.
        //    - Jika diizinkan, tampilkan konten halaman (<Outlet />).
        //    - Jika tidak, arahkan ke halaman lain yang pasti bisa mereka akses (misal, /dashboard).
        if (allowedRoles && allowedRoles.includes(userRole)) {
            return <Outlet />; // Lolos, tampilkan halaman yang dituju
        } else {
            // Role tidak sesuai, arahkan ke dashboard
            return <Navigate to="/dashboard" replace />;
        }

    } catch (error) {
        // Ini terjadi jika token ada tapi tidak valid/rusak.
        // Hapus token yang rusak dan paksa login ulang.
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;