"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { Search, Plus } from "lucide-react";

export default function TeacherHomeworkPage() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { accessToken, user } = useAuthStore();

  const fetchHomeworks = async () => {
    if (!accessToken || !user?.teacherProfile?.id) return;
    setLoading(true);
    try {
      // In MVP, we might filter by teacher_id
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework?teacherId=${user.teacherProfile.id}&search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.data) {
        setHomeworks(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, [accessToken, user, searchTerm]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Homework Management</h1>
          <p className="text-slate-500">Create, assign, and manage homework.</p>
        </div>
        <Button asChild>
          <Link href="/teacher/homework/create">
            <Plus className="mr-2 h-4 w-4" /> Create Homework
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search homework title..." 
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
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading homeworks...</td></tr>
            ) : homeworks.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">No homework found.</td></tr>
            ) : homeworks.map(hw => (
              <tr key={hw.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-primary">{hw.title}</td>
                <td className="px-6 py-4">{hw.class?.class_name} - {hw.class?.section}</td>
                <td className="px-6 py-4">{hw.subject?.name}</td>
                <td className="px-6 py-4">{new Date(hw.due_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${hw.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                      hw.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 
                      'bg-red-100 text-red-700'}`}>
                    {hw.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/teacher/homework/${hw.id}`}>View / Edit</Link>
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
