import React from "react";
import { Trash2, Eye } from "lucide-react";
import { Car, Building2, Shield, DollarSign, Calendar } from "lucide-react";

const PolicyCard = ({
  policyId,
  title,
  provider,
  status = "active",
  policyNumber,
  type,
  coverage,
  premium, // Format: "₹1000/Monthly"
  expiry, // Format: "Expires 1/1/2026"
  onView,
  onDelete,
}) => {
  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-yellow-100 text-yellow-800 border-yellow-200",
    expired: "bg-red-100 text-red-800 border-red-200",
  };

  // Helper to determine icon based on policy type (simplified)
  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case "auto insurance":
        return <Car className="w-6 h-6 text-white" />;
      case "home insurance":
        return <Building2 className="w-6 h-6 text-white" />;
      default:
        return <Shield className="w-6 h-6 text-white" />;
    }
  };

  // Split premium into amount and frequency for display
  const [premiumAmount, premiumFrequency] = premium
    ? premium.split("/")
    : ["N/A", ""];

  return (
    <div className="rounded-lg border text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              {getIcon(type)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{title}</h3>
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {provider}
              </p>
            </div>
          </div>
          <div
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[status]}`}
          >
            {status}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 pt-0 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Policy Number</p>
            <p className="font-medium truncate">{policyNumber}</p>
          </div>
          <div>
            <p className="text-slate-500">Type</p>
            <p className="font-medium capitalize">{type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
          <Shield className="w-4 h-4 text-slate-600" />
          <div>
            <p className="text-xs text-slate-500">Coverage</p>
            <p className="font-semibold text-slate-900">{coverage}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>{premiumAmount}</span>
            <span className="text-xs">
              {premiumFrequency && `/${premiumFrequency}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{expiry}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {/* View Button */}
          <button
            onClick={onView}
            className="inline-flex items-center justify-center gap-2 rounded-md border h-10 px-4 py-2 flex-1 text-sm font-medium hover:bg-gray-100 hover:text-gray-700 transition duration-150"
          >
            <Eye className="w-3 h-3 mr-1" /> View
          </button>

          {/* Delete Button (Replaced Edit) */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevents accidental navigation
              onDelete(policyId); // Call the delete handler
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md border h-10 px-4 py-2 text-sm font-medium border-red-200 text-red-600 hover:bg-red-50 transition duration-150"
            title={`Delete Policy ${policyNumber}`}
          >
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
