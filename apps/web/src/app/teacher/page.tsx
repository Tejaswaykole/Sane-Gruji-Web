"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { BookOpen, Bell, ListTodo, GraduationCap } from "lucide-react";

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/teacher`, {
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
          <h1 className="text-3xl font-bold text-slate-900">Teacher Workspace</h1>
          <p className="text-slate-500">Quickly manage your classes, assignments, and communications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Assigned Classes" value={data.kpis?.assignedClasses || 0} icon={<GraduationCap className="text-indigo-600" />} bg="bg-indigo-50" />
        <KpiCard title="Homework Assigned" value={data.kpis?.homeworkAssigned || 0} icon={<BookOpen className="text-orange-600" />} bg="bg-orange-50" />
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center space-y-3">
          <h3 className="font-bold text-slate-900">Quick Actions</h3>
          <Button size="sm" asChild><Link href="/teacher/attendance"><ListTodo className="mr-2 h-4 w-4" /> Take Attendance</Link></Button>
          <Button size="sm" variant="outline" asChild><Link href="/teacher/homework/create"><BookOpen className="mr-2 h-4 w-4" /> Create Homework</Link></Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Bell className="h-5 w-5 text-amber-500" /> Recent Notices & Circulars</h3>
          <Link href="/teacher/notices" className="text-sm text-primary hover:underline">View Notice Board</Link>
        </div>
        {data.widgets?.recentNotices?.length === 0 ? (
          <p className="text-slate-500">No recent notices.</p>
        ) : (
          <div className="space-y-4">
            {data.widgets?.recentNotices?.map((notice: any) => (
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
    </div>
  );
}

function KpiCard({ title, value, icon, bg }: { title: string, value: string | number, icon: React.ReactNode, bg: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${bg}`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
