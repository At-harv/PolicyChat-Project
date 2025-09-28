import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPolicyById } from "../api.js";
import Sidebar from "./Sidebar.jsx";

const PolicyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await getPolicyById(id, token);
        setPolicy(response.policy);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch policy details:", err);
        setError("Failed to load policy details.");
        setLoading(false);
      }
    };

    if (id) {
      fetchPolicy();
    }
  }, [id, navigate]);

  const handleViewDocuments = (documents) => {
    if (documents.length > 0) {
      console.log(`Opening documents:`);
      documents.forEach((docPath) => {
        const fullUrl = `http://localhost:8000${docPath}`;
        if (fullUrl) {
          window.open(fullUrl, "_blank");
        }
      });
    } else {
      console.log("No documents available.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        Loading policy details...
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-red-600">
        {error || "Policy not found."}
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen font-inter">
      <div className="flex-1 p-8 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-xl">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-gray-600 transition duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-left"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 text-center flex-1">
              {policy.policyName}
            </h2>
            <span
              className={`text-sm font-semibold rounded-full px-3 py-1 ${
                policy.status.toLowerCase() === "active"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {policy.status}
            </span>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-600">{policy.insuranceCompany}</p>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Policy Information
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <p className="text-gray-500">Policy Number</p>
              <p className="font-semibold text-gray-700">
                {policy.policyNumber}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Policy Type</p>
              <p className="font-semibold text-gray-700">{policy.policyType}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Financial Details
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <p className="text-gray-500">Coverage Amount</p>
              <p className="text-2xl font-semibold text-blue-600">{`₹${policy.coverageAmount.toLocaleString(
                "en-IN"
              )}`}</p>
            </div>
            <div>
              <p className="text-gray-500">Premium</p>
              <p className="text-2xl font-semibold text-green-600">
                {`₹${policy.premiumAmount.toLocaleString("en-IN")}`}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  /{policy.premiumFrequency}
                </span>
              </p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-4">Policy Dates</h3>
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <p className="text-gray-500">Start Date</p>
              <p className="font-semibold text-gray-700">
                {formatDate(policy.startDate)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">End Date</p>
              <p className="font-semibold text-gray-700">
                {formatDate(policy.endDate)}
              </p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-4">Notes</h3>
          <div className="mb-8">
            <p className="text-sm text-gray-700 italic">
              {policy.notes || "No notes available."}
            </p>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Uploaded Documents
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewDocuments(policy.documents)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
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
              <span>View Documents ({policy.documents.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetails;
