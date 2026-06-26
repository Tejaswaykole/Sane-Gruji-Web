"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Phone, CheckCircle, MailPlus, Activity } from "lucide-react";

export default function AdmissionOfficerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/admission-officer`, {
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
          <h1 className="text-3xl font-bold text-slate-900">Admission CRM</h1>
          <p className="text-slate-500">Manage incoming leads and prospective student pipelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="New Leads" value={data.kpis.newInquiries} icon={<MailPlus className="text-blue-600" />} bg="bg-blue-50" />
        <KpiCard title="Contacted" value={data.kpis.contacted} icon={<Phone className="text-yellow-600" />} bg="bg-yellow-50" />
        <KpiCard title="Interested" value={data.kpis.interested} icon={<Activity className="text-purple-600" />} bg="bg-purple-50" />
        <KpiCard title="Closed / Admitted" value={data.kpis.closed} icon={<CheckCircle className="text-green-600" />} bg="bg-green-50" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-900">Recent Inquiries</h3>
          <Link href="/admission-officer/inquiries" className="text-sm text-primary hover:underline">View All Inquiries</Link>
        </div>
        {data.widgets.recentInquiries?.length === 0 ? (
          <p className="text-slate-500">No recent inquiries.</p>
        ) : (
          <div className="space-y-4">
            {data.widgets.recentInquiries?.map((inquiry: any) => (
              <div key={inquiry.id} className="flex justify-between items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <h4 className="font-bold text-slate-800">{inquiry.student_name}</h4>
                  <div className="text-sm text-slate-500 mt-1 flex gap-4">
                    <span>Grade: {inquiry.grade_applying}</span>
                    <span>Parent: {inquiry.parent_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold 
                    ${inquiry.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 
                      inquiry.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-700' : 
                      inquiry.status === 'INTERESTED' ? 'bg-purple-100 text-purple-700' : 
                      'bg-slate-100 text-slate-700'}`}>
                    {inquiry.status}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admission-officer/inquiries/${inquiry.id}`}>Review</Link>
                  </Button>
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
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${bg}`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
