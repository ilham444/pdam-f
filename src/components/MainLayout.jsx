import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Pastikan path ke Navbar Anda sudah benar

const MainLayout = () => {
  return (
    <div className="bg-gray-200 min-h-screen">
      <Navbar /> {/* Navbar akan selalu tampil di atas */}
      <main className="pt-24 px-10 sm:px-16">
        {/* <Outlet /> adalah tempat halaman spesifik (Dashboard, ManagePegawai, dll.) akan dirender */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;