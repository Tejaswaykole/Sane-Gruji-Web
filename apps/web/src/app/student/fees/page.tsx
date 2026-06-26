"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function StudentFeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/fees`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => { if (data.data) setFees(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [accessToken]);

  const summary = fees.reduce((acc, f) => {
    if (f.status === 'PENDING' || f.status === 'OVERDUE') acc.due += f.amount;
    if (f.status === 'CLEARED') acc.cleared += f.amount;
    return acc;
  }, { due: 0, cleared: 0 });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Fee Status</h1>
        <p className="text-slate-500">View your current fee records and due amounts.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
          <h3 className="text-red-800 font-semibold mb-2">Total Amount Due</h3>
          <p className="text-4xl font-bold text-red-600">${summary.due.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
          <h3 className="text-green-800 font-semibold mb-2">Total Cleared</h3>
          <p className="text-4xl font-bold text-green-600">${summary.cleared.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Academic Year</th>
              <th className="px-6 py-4">Fee Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">Loading fees...</td></tr>
            ) : fees.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">No fee records found.</td></tr>
            ) : fees.map(fee => (
              <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">{fee.academic_year}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{fee.fee_type}</td>
                <td className="px-6 py-4 font-bold">${fee.amount.toFixed(2)}</td>
                <td className="px-6 py-4">{new Date(fee.due_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold 
                    ${fee.status === 'CLEARED' ? 'bg-green-100 text-green-700' : 
                      fee.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 
                      fee.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-slate-100 text-slate-700'}`}>
                    {fee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
