"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  BookOpen,
  User,
  BadgeCheck,
} from "lucide-react";

type Certificate = {
  id: number;
  certificateId: string;
  holderName: string;
  courseName: string;
  issueDate: string;
  expiryDate: string | null;
  isValid: boolean;
  createdAt: string;
};

export default function VerifyForm() {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    certificate?: Certificate;
    error?: string;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/verify?id=${encodeURIComponent(certId.trim())}`
      );
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <h3 className="font-poppins font-bold text-xl text-navy-900 dark:text-white mb-2">
          Enter Certificate ID
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Certificate IDs follow the format{" "}
          <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">
            ARX-2025-WD-001
          </code>
        </p>
        <form onSubmit={handleVerify} className="flex gap-3">
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value.toUpperCase())}
            placeholder="ARX-2025-WD-001"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !certId.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins rounded transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            Verify
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="animate-fade-in">
          {result.error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex items-start gap-4">
              <XCircle size={28} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-poppins font-bold text-red-700 dark:text-red-400 mb-1">
                  Certificate Not Found
                </p>
                <p className="text-red-600 dark:text-red-300 text-sm">
                  {result.error}
                </p>
              </div>
            </div>
          ) : result.certificate ? (
            <div
              className={`rounded-2xl p-6 border-2 ${
                result.certificate.isValid
                  ? "bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700"
                  : "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700"
              }`}
            >
              {/* Status badge */}
              <div className="flex items-center gap-3 mb-6">
                {result.certificate.isValid ? (
                  <>
                    <CheckCircle2 size={32} className="text-green-500" />
                    <div>
                      <p className="font-poppins font-bold text-green-700 dark:text-green-400 text-lg">
                        Certificate Verified ✓
                      </p>
                      <p className="text-green-600 dark:text-green-300 text-sm">
                        This is a valid ARX Infotech certificate.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle size={32} className="text-red-500" />
                    <div>
                      <p className="font-poppins font-bold text-red-700 dark:text-red-400 text-lg">
                        Certificate Revoked
                      </p>
                      <p className="text-red-600 dark:text-red-300 text-sm">
                        This certificate has been revoked.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: User,
                    label: "Certificate Holder",
                    value: result.certificate.holderName,
                  },
                  {
                    icon: BookOpen,
                    label: "Course / Programme",
                    value: result.certificate.courseName,
                  },
                  {
                    icon: BadgeCheck,
                    label: "Certificate ID",
                    value: result.certificate.certificateId,
                  },
                  {
                    icon: Calendar,
                    label: "Issue Date",
                    value: fmt(result.certificate.issueDate),
                  },
                  ...(result.certificate.expiryDate
                    ? [
                        {
                          icon: Calendar,
                          label: "Expiry Date",
                          value: fmt(result.certificate.expiryDate),
                        },
                      ]
                    : []),
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className="text-gold-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {label}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
