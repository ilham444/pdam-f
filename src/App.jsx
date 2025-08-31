import React from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'

// Public
import Login from './pages/Login'
import 'leaflet/dist/leaflet.css';

// Halaman Khusus Admin
import ManagePegawai from './pages/ManagePegawai';

// Protection Component
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Halaman yang Perlu Login (Untuk Admin & Pegawai)
import Dashboard from './pages/Dashboard'
import Map from './pages/Map'
import Form from './pages/Form'
import List from './pages/List'
import Analytic from './pages/Analytic'
import Edit from './pages/Edit'
import EditForm from './pages/EditForm'
import DetailPelanggan from './pages/DetailPelanggan'

// Layout Component untuk nested routes (ini sudah bagus, tidak perlu diubah)
const DaftarPelangganLayout = () => {
  return <Outlet />;
}

function App() {

  return (
    <Routes>
      {/* RUTE PUBLIK: Hanya untuk yang belum login */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />


      {/* --- GRUP 1: RUTE UNTUK ADMIN & PEGAWAI --- */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'pegawai']} />}>
        {/* Semua rute di dalam grup ini bisa diakses oleh admin DAN pegawai */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/peta" element={<Map />} />
        <Route path="/input-data" element={<Form />} />
        <Route path="/daftar-pelanggan" element={<DaftarPelangganLayout />}>
          <Route index element={<List />} />
          <Route path='edit-pelanggan/:id' element={<EditForm />} />
          <Route path='detail-pelanggan/:id' element={<DetailPelanggan />} />
        </Route>
        <Route path="/analitik" element={<Analytic />} />
        <Route path="/edit-profile" element={<Edit />} />
      </Route>


      {/* --- GRUP 2: RUTE KHUSUS UNTUK ADMIN --- */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        {/* Rute di dalam grup ini HANYA bisa diakses oleh admin */}
        <Route path="/admin/manage-pegawai" element={<ManagePegawai />} />
      </Route>


      {/* Rute fallback jika halaman tidak ditemukan (opsional) */}
      <Route path="*" element={<h1>404: Halaman Tidak Ditemukan</h1>} />

    </Routes>
  )
}

export default App