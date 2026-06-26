"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { Search, Plus } from "lucide-react";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { accessToken } = useAuthStore();

  const fetchNotices = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.data) setNotices(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [accessToken, searchTerm]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notice Board</h1>
          <p className="text-slate-500">Manage school announcements and circulars.</p>
        </div>
        <Button asChild>
          <Link href="/admin/notices/create">
            <Plus className="mr-2 h-4 w-4" /> Create Notice
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search notices..." 
            className="pl-10" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Publish Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">Loading notices...</td></tr>
            ) : notices.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">No notices found.</td></tr>
            ) : notices.map(notice => (
              <tr key={notice.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-primary">{notice.title}</td>
                <td className="px-6 py-4">{notice.category}</td>
                <td className="px-6 py-4">{notice.publish_date ? new Date(notice.publish_date).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${notice.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                      notice.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 
                      notice.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700' : 
                      'bg-red-100 text-red-700'}`}>
                    {notice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/notices/${notice.id}`}>View</Link>
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
