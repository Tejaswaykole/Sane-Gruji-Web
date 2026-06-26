"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Users, Bell, DollarSign, Activity } from "lucide-react";

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/parent`, {
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
          <h1 className="text-3xl font-bold text-slate-900">Parent Portal</h1>
          <p className="text-slate-500">Track your children's progress and school communications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Children Enrolled" value={data.kpis?.childrenCount || 0} icon={<Users className="text-emerald-600" />} bg="bg-emerald-50" />
        <KpiCard title="Total Pending Fees" value={`$${(data.kpis?.pendingFeesAmount || 0).toFixed(2)}`} icon={<DollarSign className="text-red-600" />} bg="bg-red-50" />
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-md flex flex-col justify-center">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Activity className="w-5 h-5" /> Quick Links</h3>
          <div className="space-y-2 mt-4">
            <Button variant="secondary" size="sm" className="w-full justify-start" asChild><Link href="/parent/fees">Pay / View Fees</Link></Button>
            <Button variant="secondary" size="sm" className="w-full justify-start" asChild><Link href="/parent/homework">View Homework</Link></Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Bell className="h-5 w-5 text-amber-500" /> Recent Notices</h3>
          <Link href="/parent/notices" className="text-sm text-primary hover:underline">View Notice Board</Link>
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
