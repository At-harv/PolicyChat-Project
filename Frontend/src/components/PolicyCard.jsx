import {
  Car,
  Building2,
  Shield,
  DollarSign,
  Calendar,
  Eye,
  SquarePen,
} from "lucide-react";

export default function PolicyCard({
  title,
  provider,
  status = "active",
  policyNumber,
  type,
  coverage,
  premium,
  expiry,
  onView,
  onEdit,
}) {
  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-yellow-100 text-yellow-800 border-yellow-200",
    expired: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="rounded-lg border text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
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
            <span>{premium}</span>
            <span className="text-xs">/monthly</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{expiry}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onView}
            className="inline-flex items-center justify-center gap-2 rounded-md border h-10 px-4 py-2 flex-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Eye className="w-3 h-3 mr-1" /> View
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-md border h-10 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <SquarePen className="w-3 h-3 mr-1" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}
