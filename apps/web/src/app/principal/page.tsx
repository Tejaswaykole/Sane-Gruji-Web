"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Users, GraduationCap, School, CalendarCheck } from "lucide-react";

export default function PrincipalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/principal`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [accessToken]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load dashboard data</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Principal Dashboard</h1>
          <p className="text-slate-500">Academic overview and attendance analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Students" value={data.kpis.totalStudents} icon={<GraduationCap className="text-blue-600" />} bg="bg-blue-50" />
        <KpiCard title="Total Teachers" value={data.kpis.totalTeachers} icon={<Users className="text-indigo-600" />} bg="bg-indigo-50" />
        <KpiCard title="Active Classes" value={data.kpis.totalClasses} icon={<School className="text-purple-600" />} bg="bg-purple-50" />
        <KpiCard title="Today's Attendance" value={`${data.kpis.attendanceToday}%`} icon={<CalendarCheck className="text-emerald-600" />} bg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900">Recent Notices</h3>
          </div>
          {data.widgets.recentNotices?.length === 0 ? (
            <p className="text-slate-500">No recent notices.</p>
          ) : (
            <div className="space-y-4">
              {data.widgets.recentNotices?.map((notice: any) => (
                <div key={notice.id} className="flex flex-col border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <h4 className="font-semibold text-slate-800">{notice.title}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{notice.category}</span>
                    <span className="text-xs text-slate-500">{new Date(notice.publish_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-900">Reports & Analytics</h3>
            <p className="text-slate-500 mt-2 max-w-sm">Access deep dive reports on academic performance, attendance trends, and school operations.</p>
          </div>
          <Button asChild className="mt-4"><Link href="/admin/reports">View Reports Hub</Link></Button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, bg }: { title: string, value: string | number, icon: React.ReactNode, bg: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${bg}`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
