"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { Search } from "lucide-react";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { accessToken } = useAuthStore();

  const fetchInquiries = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (statusFilter) queryParams.append("status", statusFilter);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admissions?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.data) setInquiries(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [accessToken, searchTerm, statusFilter]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admission Inquiries</h1>
          <p className="text-slate-500">Manage and follow-up with prospective students.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name, email, or phone..." 
            className="pl-10" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="INTERESTED">Interested</option>
          <option value="NOT_INTERESTED">Not Interested</option>
          <option value="ADMISSION_COMPLETED">Completed</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Parent Name</th>
              <th className="px-6 py-4">Grade</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading inquiries...</td></tr>
            ) : inquiries.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">No inquiries found.</td></tr>
            ) : inquiries.map(inquiry => (
              <tr key={inquiry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-semibold text-primary">{inquiry.student_name}</td>
                <td className="px-6 py-4 text-slate-700">{inquiry.parent_name}</td>
                <td className="px-6 py-4">{inquiry.grade_applying}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${inquiry.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 
                      inquiry.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-700' : 
                      inquiry.status === 'INTERESTED' ? 'bg-purple-100 text-purple-700' : 
                      inquiry.status === 'ADMISSION_COMPLETED' ? 'bg-green-100 text-green-700' : 
                      'bg-slate-100 text-slate-700'}`}>
                    {inquiry.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admission-officer/inquiries/${inquiry.id}`}>Manage</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
