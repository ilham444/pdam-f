import React, { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // axios instance yang sudah ada baseURL & Authorization header

const Header = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Ambil user dari backend pakai token
        const response = await api.get('/api/auth/user');
        setUserEmail(response.data.email);
      } catch (error) {
        console.error("Failed to fetch user", error);
        handleLogout(false); // langsung logout kalau token invalid
      }
    };

    fetchUser();
  }, []);

  const handleLogout = (confirm = true) => {
    if (confirm) {
      const isConfirm = window.confirm('Apakah anda yakin akan keluar?');
      if (!isConfirm) return;
    }

    // Hapus token dari localStorage
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="grid grid-cols-2 sm:grid-cols-3 items-center w-full py-4 px-8 bg-[#7da7db]">
      <img src="./logo.png" alt="" className="w-20" />
      <div className="mx-auto text-center hidden sm:block">
        <h1 className="text-white font-bold text-2xl">PDAM Tirta Intan</h1>
        <h5 className="text-white text-xl">Sistem Mapping Data Pelanggan</h5>
      </div>
      <div className="flex justify-end items-center text-white space-x-4">
        <span>{userEmail ? userEmail : 'Loading..'}</span>
        <FaUserCircle size={32} />
        <button
          onClick={() => handleLogout()}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
