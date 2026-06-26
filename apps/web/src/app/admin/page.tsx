"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Users, GraduationCap, School, Activity, PlusCircle, Bell, DollarSign, CalendarCheck } from "lucide-react";

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/admin`, {
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
          <h1 className="text-3xl font-bold text-slate-900">Admin Command Center</h1>
          <p className="text-slate-500">Platform overview and key performance metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/admin/students/create"><PlusCircle className="mr-2 h-4 w-4" /> Add Student</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/teachers/create"><PlusCircle className="mr-2 h-4 w-4" /> Add Teacher</Link></Button>
          <Button asChild><Link href="/admin/notices/create"><Bell className="mr-2 h-4 w-4" /> Publish Notice</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KpiCard title="Students" value={data.kpis.totalStudents} icon={<GraduationCap className="text-blue-600" />} bg="bg-blue-50" />
        <KpiCard title="Teachers" value={data.kpis.totalTeachers} icon={<Users className="text-indigo-600" />} bg="bg-indigo-50" />
        <KpiCard title="Classes" value={data.kpis.totalClasses} icon={<School className="text-purple-600" />} bg="bg-purple-50" />
        <KpiCard title="Active Users" value={data.kpis.activeUsers} icon={<Activity className="text-emerald-600" />} bg="bg-emerald-50" />
        <KpiCard title="Attendance Today" value={`${data.kpis.attendanceToday}%`} icon={<CalendarCheck className="text-amber-600" />} bg="bg-amber-50" />
        <KpiCard title="Pending Fees" value={`$${data.kpis.pendingFeesAmount.toFixed(0)}`} icon={<DollarSign className="text-red-600" />} bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900">Recent Notices</h3>
              <Link href="/admin/notices" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            {data.widgets.recentNotices?.length === 0 ? (
              <p className="text-slate-500">No recent notices.</p>
            ) : (
              <div className="space-y-4">
                {data.widgets.recentNotices?.map((notice: any) => (
                  <div key={notice.id} className="flex justify-between items-start border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold text-slate-800">{notice.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{notice.category}</span>
                        <span className="text-xs text-slate-500">{new Date(notice.publish_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link href={`/admin/notices/${notice.id}`} className="text-sm text-primary hover:underline">Details</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-focus rounded-xl p-6 text-white shadow-md">
            <h3 className="font-bold text-lg mb-2">School Reports</h3>
            <p className="text-primary-content text-sm mb-6">View consolidated reports across all modules.</p>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/admin/reports">Open Reports Hub</Link>
            </Button>
          </div>
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
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
