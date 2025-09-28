import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  TrendingUp,
  DollarSign,
  Clock,
  MessageSquare,
  PlusSquare,
} from "lucide-react";

import { getDashboardStats } from "../api.js";

const PolicyChatDashboard = () => {
  const [stats, setStats] = useState({
    activePolicies: 0,
    totalCoverage: 0,
    monthlyPremiums: 0,
    expiringSoon: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // If no token is found, redirect to login page
        navigate("/login");
        return;
      }

      try {
        const data = await getDashboardStats(token);
        setStats({
          activePolicies: data.stats.activePolicies,
          totalCoverage: data.stats.totalCoverage,
          monthlyPremiums: data.stats.monthlyPremiums,
          expiringSoon: data.stats.expiringSoon,
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        // Check for common auth errors (e.g., 401 Unauthorized)
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to load dashboard data. Please try again.");
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [navigate]);

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  // Handler for "Add Policy" button click
  const handleAddPolicyClick = () => {
    navigate("/addpolicy");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen font-inter">
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Welcome Section */}
        <div className="flex flex-col items-center text-center my-12">
          <div className="p-4 bg-blue-100 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-shield"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome to PolicyChat
          </h1>
          <p className="mt-2 text-gray-600">
            Your AI-powered insurance assistant is ready to help
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Active Policies */}
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Active Policies</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.activePolicies}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-file-text"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M10 9H8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
              </svg>
            </div>
          </div>
          {/* Card 2: Total Coverage */}
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Coverage</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(stats.totalCoverage)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(139, 92, 246)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-shield-check"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
          {/* Card 3: Monthly Premiums */}
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Monthly Premiums</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(stats.monthlyPremiums)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-dollar-sign"
              >
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          {/* Card 4: Expiring Soon */}
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.expiringSoon.length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-alert-triangle"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Start Chatting */}
          <div className="bg-blue-600 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="text-white" />
                <h3 className="text-lg font-semibold text-white">
                  Start Chatting
                </h3>
              </div>
              <p className="text-sm text-blue-200">
                Ask questions about your policies, get instant answers powered
                by AI
              </p>
            </div>
            <a href="/chat">
              <button
                className="mt-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition duration-200"
                style={{ width: "176px", height: "36px" }}
              >
                Open Chat Assistant
              </button>
            </a>
          </div>
          {/* Card 2: Add New Policy */}
          <div className="bg-green-600 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <PlusSquare className="text-white" />
                <h3 className="text-lg font-semibold text-white">
                  Add New Policy
                </h3>
              </div>
              <p className="text-sm text-green-200">
                Upload and manage your insurance policy documents
              </p>
            </div>
            <button
              onClick={handleAddPolicyClick}
              className="mt-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition duration-200"
              style={{ width: "147px", height: "36px" }}
            >
              Add Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyChatDashboard;
