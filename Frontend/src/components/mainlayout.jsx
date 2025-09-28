// src/layouts/MainLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 font-inter overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="w-64 h-screen fixed left-0 top-0 z-50">
        <Sidebar />
      </div>

      {/* Main content (adds margin-left equal to sidebar width) */}
      <div className="flex-1 ml-64 overflow-y-auto p-8 h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
