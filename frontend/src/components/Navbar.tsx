import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, User, Shield } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="College Logo" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-orange to-yellow-500 bg-clip-text text-transparent">
              Exam Portal
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-500">
               <Link to="/" className="hover:text-primary-orange transition-colors">Dashboard</Link>
               <Link to="/results" className="hover:text-primary-orange transition-colors">Results</Link>
            </div>

            <div className="h-8 w-[1px] bg-gray-200 hidden md:block" />

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-gray-800">{user.name}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary-orange flex items-center gap-1">
                  {user.role === 'admin' ? null : <User size={10} />} {user.role}
                </span>
              </div>
              
              <div className="w-10 h-10 rounded-full border-2 border-primary-orange overflow-hidden shadow-sm">
                {user.profileImage ? (
                  <img src={`${import.meta.env.VITE_API_BASE_URL}${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-orange-100 flex items-center justify-center text-primary-orange font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
