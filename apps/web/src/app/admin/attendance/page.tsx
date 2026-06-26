"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

export default function AdminAttendanceAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/analytics`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [accessToken]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
  if (!analytics) return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Attendance Analytics</h1>
        <p className="text-slate-500">School-wide attendance metrics and alerts.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Present %</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{analytics.present_pct}%</p>
          <p className="text-xs text-slate-400 mt-1">{analytics.present} records</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Absent %</h3>
          <p className="text-4xl font-bold text-red-600 mt-2">{analytics.absent_pct}%</p>
          <p className="text-xs text-slate-400 mt-1">{analytics.absent} records</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Late %</h3>
          <p className="text-4xl font-bold text-yellow-600 mt-2">{analytics.late_pct}%</p>
          <p className="text-xs text-slate-400 mt-1">{analytics.late} records</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Leave %</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{analytics.leave_pct}%</p>
          <p className="text-xs text-slate-400 mt-1">{analytics.leave} records</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex items-center justify-center bg-slate-50">
          <p className="text-slate-500 font-medium">Monthly Trend Chart</p>
          {/* Implement Recharts here if needed */}
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex items-center justify-center bg-slate-50">
          <p className="text-slate-500 font-medium">Class-wise Distribution Chart</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
          Low Attendance Alerts (&lt;75%)
        </h2>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Attendance %</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {analytics.alerts.map((alert: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{alert.student_name}</td>
                <td className="px-6 py-4 text-slate-700">{alert.class}</td>
                <td className={`px-6 py-4 font-bold ${alert.status === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'}`}>{alert.percentage}%</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${alert.status === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {alert.status}
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
