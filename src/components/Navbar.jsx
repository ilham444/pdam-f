// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const handleLogout = (confirm = true) => {
        if (confirm) {
            const isConfirm = window.confirm("Apakah anda yakin akan keluar?");
            if (!isConfirm) return;
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Ambil token dari localStorage
                const token = localStorage.getItem("token");
                if (!token) {
                    handleLogout(false);
                    return;
                }

                // Decode langsung dari JWT (lebih cepat)
                const decoded = jwtDecode(token);
                setUser(decoded);

                // Opsional: Ambil data user detail dari API
                // const response = await api.get("/api/auth/user");
                // setUser(response.data);

            } catch (error) {
                console.error("Failed to fetch user", error);
                handleLogout(false);
            }
        };
        fetchUser();
    }, []);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    // Daftar menu default
    const navItems = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Peta", path: "/peta" },
        { name: "Input", path: "/input-data" },
        { name: "Pelanggan", path: "/daftar-pelanggan" },
    ];

    // Jika user role admin → tambahkan menu khusus
    if (user && user.role === "admin") {
        navItems.push({ name: "Manajemen Pegawai", path: "/admin/manage-pegawai" });
    }

    return (
        <div className="flex justify-center items-center mx-auto z-50">
            <nav className="flex fixed w-4/5 gap-4 lg:gap-2 justify-center xl:gap-20 mx-auto bg-white py-4 rounded-2xl shadow-lg border border-gray-200 text-lg px-4 mb-8 z-50">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="" className="w-16 h-16 p-2 rounded-lg border border-gray-200 shadow-md" />
                    <div className="font-bold tracking-wide text-xl">
                        <h1 className="text-blue-500">PDAM</h1>
                        <h1 className="text-sm bg-linear-to-r from-green-500 to-yellow-500 bg-clip-text text-transparent">Tirta Intan</h1>
                    </div>
                </div>

                {/* Menu Desktop */}
                <div className="border border-gray-200 bg-gray-100 shadow-inner rounded-full flex items-center py-2">
                    <button
                        onClick={toggleNav}
                        className="lg:hidden flex items-center justify-center p-2 rounded-full bg-gray-200 shadow-md hover:bg-gray-300 mx-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `hidden lg:flex justify-center items-center font-bold mb-4 p-2 rounded-4xl sm:mb-0 mx-2 text-xs ${
                                    isActive ? "text-white bg-blue-400" : "text-gray-500 hover:text-blue-300"
                                }`
                            }
                        >
                            <h5>{item.name}</h5>
                        </NavLink>
                    ))}
                </div>

                {/* User info & Logout */}
                <div className="hidden sm:flex gap-4 items-center">
                    <button
                        onClick={() => handleLogout()}
                        className="border p-2 rounded-full bg-red-200 cursor-pointer border-gray-200 shadow-md"
                    >
                        <FaArrowRightFromBracket className="text-red-500" />
                    </button>
                    <FaUserCircle className="border-2 rounded-full border-sky-300 p-0.5" size="50" />
                    <div className="font-medium text-xs w-20 overflow-auto">
                        <h1>{user ? user.email || user.username : "Loading..."}</h1>
                    </div>
                </div>
            </nav>

            {/* Menu Mobile */}
            <div
                className={`${
                    isNavOpen ? "-translate-y-40" : "translate-y-16"
                } lg:hidden border fixed transition-all ease-in-out border-gray-200 bg-gray-100 shadow-inner flex rounded-full items-center py-2`}
            >
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex justify-center items-center font-bold rounded-4xl sm:mb-0 mx-2 ${
                                isActive ? "text-white bg-blue-400" : "text-gray-500 hover:text-blue-300"
                            }`
                        }
                    >
                        <h5>{item.name}</h5>
                    </NavLink>
                ))}
                <button
                    onClick={() => handleLogout()}
                    className="sm:hidden flex justify-center items-center font-bold rounded-4xl sm:mb-0 mx-2 text-red-500"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
