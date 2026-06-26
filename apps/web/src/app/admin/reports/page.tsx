"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function ReportsHubPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/reports`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [accessToken]);

  if (loading) return <div className="p-8 text-center text-slate-500">Generating Reports...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load reports</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports Hub</h1>
        <p className="text-slate-500">Consolidated analytics and data exports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Class Enrollment Report */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-4 border-b pb-2">Class Enrollment</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="pb-2">Class Name</th>
                <th className="pb-2">Section</th>
                <th className="pb-2 text-right">Students Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.studentsByClass?.map((c: any) => (
                <tr key={c.id}>
                  <td className="py-3 font-medium text-slate-800">{c.class_name}</td>
                  <td className="py-3">{c.section}</td>
                  <td className="py-3 text-right font-bold text-primary">{c._count.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fee Status Report */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-4 border-b pb-2">Fee Status Summary</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Total Records</th>
                <th className="pb-2 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.feesByStatus?.map((f: any) => (
                <tr key={f.status}>
                  <td className="py-3 font-bold text-slate-700">{f.status}</td>
                  <td className="py-3 text-right">{f._count}</td>
                  <td className="py-3 text-right font-medium">${f._sum.amount?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Admission Inquiry Report */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-4 border-b pb-2">Admission Inquiry Pipeline</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Inquiries Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.inquiriesByStatus?.map((i: any) => (
                <tr key={i.status}>
                  <td className="py-3 font-bold text-slate-700">{i.status}</td>
                  <td className="py-3 text-right text-lg font-medium">{i._count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
