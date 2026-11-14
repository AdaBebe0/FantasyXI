"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

async function fetchKycStatus() {
  return await api.get<{ status: string }>("/api/v1/sep8/kyc/status");
}

async function submitKycData(data: any) {
  return await api.post<{ status: string }>("/api/v1/sep8/kyc", data);
}

export default function KycPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("LOADING");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    documentId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      try {
        const data = await fetchKycStatus();
        setStatus(data.status);
      } catch (err: any) {
        setStatus("UNVERIFIED");
      }
    }
    loadStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await submitKycData(formData);
      setStatus(data.status);
    } catch (err: any) {
      setError(err.message || "Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  };

  if (status === "LOADING") {
    return (
      <div className="py-20 text-center text-slate-500 text-xs font-semibold">
        <div className="inline-block w-8 h-8 border-2 border-[#37003c] border-t-transparent rounded-full animate-spin mb-3" />
        <p>Loading verification status...</p>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          ✓
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Identity Verified</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your identity has been verified. You may now withdraw regulated assets and participate in high-roller escrow leagues.
        </p>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          ⏳
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Review in Progress</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your KYC application is currently under review by compliance. Most verifications complete within 24 hours.
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm text-slate-800">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Identity Verification</h2>
      <p className="mb-6 text-xs text-slate-500 leading-relaxed">
        Please provide your legal details to comply with SEP-8 regulated asset compliance and non-custodial payouts.
      </p>
      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
          <input 
            type="text" 
            required 
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c]"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
          <input 
            type="text" 
            required 
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c]"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Document ID (Passport / National ID)</label>
          <input 
            type="text" 
            required 
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c]"
            value={formData.documentId}
            onChange={(e) => setFormData({...formData, documentId: e.target.value})}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#37003c] hover:bg-[#26002b] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Submitting..." : "Submit Verification"}
        </button>
      </form>
    </div>
  );
}
