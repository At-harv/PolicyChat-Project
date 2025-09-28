import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  MessageSquare,
  FileText,
  UserCircle,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Common className builder for active/inactive nav items
  const getNavClass = ({ isActive }) =>
    `flex items-center space-x-3 text-sm font-medium p-3 rounded-lg transition duration-150 ${
      isActive
        ? "bg-gray-100 text-blue-600 font-semibold"
        : "text-gray-500 hover:bg-gray-100 hover:text-blue-600"
    }`;

  return (
    <div className="w-64 h-screen bg-white shadow-lg p-6 flex flex-col justify-between">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Shield className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-gray-800">PolicyChat</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-4 flex-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">
            Navigation
          </p>

          <NavLink to="/dashboard" className={getNavClass}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/chat" className={getNavClass}>
            <MessageSquare size={20} />
            <span>Chat Assistant</span>
          </NavLink>

          <NavLink to="/policies" className={getNavClass}>
            <FileText size={20} />
            <span>My Policies</span>
          </NavLink>
        </nav>
      </div>

      {/* User Account / Logout */}
      <div className="relative">
        <button
          onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
          className="flex items-center space-x-3 text-sm font-medium text-gray-500 w-full p-2 rounded-lg hover:bg-gray-100 transition duration-150"
        >
          <UserCircle size={20} />
          <div className="flex flex-col text-left">
            <span className="text-gray-800">Your Account</span>
            <span className="text-xs text-gray-500">
              Manage your policies securely
            </span>
          </div>
        </button>

        {isAccountMenuOpen && (
          <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-md overflow-hidden z-50">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 text-sm text-red-600 p-3 w-full text-left hover:bg-red-100 transition duration-150"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
