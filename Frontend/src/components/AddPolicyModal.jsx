import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPolicy } from "../api.js";
import Sidebar from "./Sidebar.jsx";

const AddPolicyModal = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    policyName: "",
    policyNumber: "",
    insuranceCompany: "",
    policyType: "",
    premiumAmount: "",
    premiumFrequency: "Monthly",
    coverageAmount: "",
    status: "Active",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleFileChange = (e) => {
    setDocuments(e.target.files);
  };

  const handleSavePolicy = async () => {
    const token = localStorage.getItem("token");
    setErrorMessage("");
    setLoading(true);

    if (!token) {
      setErrorMessage("You are not logged in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    // ⚠️ Validation check: Ensure at least one document is uploaded
    if (documents.length === 0) {
      setErrorMessage("Please upload at least one policy document to proceed.");
      setLoading(false);
      return; // Stop the function here
    }

    try {
      const response = await addPolicy(formData, documents, token);
      console.log("Policy created successfully:", response);
      navigate("/policies");
    } catch (err) {
      console.error("Failed to save policy:", err);
      if (err.response && err.response.status === 401) {
        setErrorMessage("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setErrorMessage(
          err.response?.data?.message ||
            "Failed to save policy. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen font-inter">
      {/* Main Content Area */}
      <div className="flex-1 p-8 flex justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Policy</h2>
            {/* Back button */}
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
                className="lucide lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {errorMessage && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="policyName"
              >
                Policy Name *
              </label>
              <input
                type="text"
                id="policyName"
                placeholder="e.g., Auto Insurance - Honda Civic"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.policyName}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="policyNumber"
              >
                Policy Number
              </label>
              <input
                type="text"
                id="policyNumber"
                placeholder="e.g., POL-123456789"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.policyNumber}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="insuranceCompany"
              >
                Insurance Company *
              </label>
              <input
                type="text"
                id="insuranceCompany"
                placeholder="e.g., State Farm"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.insuranceCompany}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="policyType"
              >
                Policy Type *
              </label>
              <select
                id="policyType"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.policyType}
                onChange={handleChange}
              >
                <option>Auto Insurance</option>
                <option>Home Insurance</option>
                <option>Life Insurance</option>
                <option>Other</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="premiumAmount"
              >
                Premium Amount
              </label>
              <input
                type="text"
                id="premiumAmount"
                placeholder="e.g., 150.00"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.premiumAmount}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="premiumFrequency"
              >
                Premium Frequency
              </label>
              <select
                id="premiumFrequency"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.premiumFrequency}
                onChange={handleChange}
              >
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="coverageAmount"
              >
                Coverage Amount
              </label>
              <input
                type="text"
                id="coverageAmount"
                placeholder="e.g., 500000"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.coverageAmount}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="status"
              >
                Status
              </label>
              <select
                id="status"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={handleChange}
              >
                <option>Active</option>
                <option>Expired</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="startDate"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="endDate"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col sm:col-span-2">
              <label
                className="text-sm font-medium text-gray-700 mb-1"
                htmlFor="notes"
              >
                Notes
              </label>
              <textarea
                id="notes"
                rows="3"
                placeholder="Additional notes about this policy..."
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => document.getElementById("documents-input").click()}
              className="flex items-center space-x-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
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
                className="lucide lucide-upload"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              <span>Upload Documents ({documents.length})</span>
              <input
                type="file"
                id="documents-input"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </button>
            <button
              onClick={handleSavePolicy}
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Policy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPolicyModal;
