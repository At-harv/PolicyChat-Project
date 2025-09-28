import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PlusSquare, FileText, Search } from "lucide-react";
import PolicyCard from "./PolicyCard";
import { getAllPolicies, deletePolicy } from "../api.js";

const MyPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All"); // New state for filtering
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicies = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await getAllPolicies(token);
        setPolicies(response.policies);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch policies:", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to load policies. Please try again.");
          setLoading(false);
        }
      }
    };

    fetchPolicies();
  }, [navigate]);

  const handleAddPolicyClick = () => {
    navigate("/addpolicy");
  };

  //expiry
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A"; // prevent invalid parsing
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // delete
  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await deletePolicy(policyId, token);
      console.log("Delete success:", res);

      setPolicies((prev) => prev.filter((p) => p.id !== policyId));
    } catch (err) {
      console.error(
        "Delete error details:",
        err.response ? err.response.data : err.message
      );
      alert("Failed to delete policy. Please try again.");
    }
  };

  // Helper function to determine if a policy passes the current filter
  const applyStatusFilter = (policy) => {
    if (filter === "All") return true;
    return policy.status.toLowerCase() === filter.toLowerCase();
  };

  // Filter policies first by search term, then by status filter
  const filteredAndSearchedPolicies = policies
    .filter(
      (policy) =>
        policy.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.insuranceCompany.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(applyStatusFilter);

  // Calculate counts for the filter tabs
  const allCount = policies.length;
  const activeCount = policies.filter(
    (p) => p.status.toLowerCase() === "active"
  ).length;
  const expiredCount = policies.filter(
    (p) => p.status.toLowerCase() === "expired"
  ).length;

  // Custom Filter Button Component for cleaner code
  const FilterButton = ({ label, count, currentFilter, onClick }) => (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition duration-150 ${
        currentFilter === label
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      onClick={onClick}
    >
      {label} ({count})
    </span>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Policies...
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
        {/* Header and Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              My Insurance Policies
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and organize your insurance documents
            </p>
          </div>
          <button
            onClick={handleAddPolicyClick}
            className="flex items-center space-x-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
          >
            <PlusSquare className="lucide" size={18} />
            <span>Add Policy Manually</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
            <FilterButton
              label="All"
              count={allCount}
              currentFilter={filter}
              onClick={() => setFilter("All")}
            />
            <FilterButton
              label="Active"
              count={activeCount}
              currentFilter={filter}
              onClick={() => setFilter("Active")}
            />
            <FilterButton
              label="Expired"
              count={expiredCount}
              currentFilter={filter}
              onClick={() => setFilter("Expired")}
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search policies..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>

        {/* Policy Cards Grid */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSearchedPolicies.length > 0 ? (
            filteredAndSearchedPolicies.map((policy) => (
              <PolicyCard
                key={policy.id}
                title={`${policy.policyName}`}
                provider={policy.insuranceCompany || "Unknown"}
                status={policy.status.toLowerCase()}
                policyNumber={policy.policyNumber}
                type={policy.policyType}
                coverage={policy.coverageAmount || "N/A"}
                premium={`$${policy.premiumAmount}`}
                expiry={`Expires ${formatDate(policy.endDate)}`}
                onView={() => navigate(`/policies/${policy.id}`)}
                onEdit={() => navigate(`/policies/edit/${policy.id}`)} // Example edit route
                onDelete={async (policyId) => {
                  if (
                    !window.confirm(
                      "Are you sure you want to delete this policy?"
                    )
                  )
                    return;

                  const token = localStorage.getItem("token");
                  if (!token) {
                    navigate("/login");
                    return;
                  }

                  try {
                    const res = await deletePolicy(policy.id, token);
                    console.log("Delete success:", res);

                    setPolicies((prev) =>
                      prev.filter((p) => p.id !== policy.id)
                    );
                  } catch (err) {
                    console.error(
                      "Delete error details:",
                      err.response ? err.response.data : err.message
                    );
                    alert("Failed to delete policy. Please try again.");
                  }
                }}
              />
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-gray-500 p-8">
              No policies found for the current filter/search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPolicies;
