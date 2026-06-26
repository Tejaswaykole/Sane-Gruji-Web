"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { Search, Plus } from "lucide-react";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { accessToken } = useAuthStore();

  const fetchExams = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.data) setExams(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [accessToken, searchTerm]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exams</h1>
          <p className="text-slate-500">Manage school examinations and schedules.</p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/create">
            <Plus className="mr-2 h-4 w-4" /> Create Exam
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search exams..." 
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
              <th className="px-6 py-4">Exam Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Academic Year</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading exams...</td></tr>
            ) : exams.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">No exams found.</td></tr>
            ) : exams.map(exam => (
              <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-primary">{exam.name}</td>
                <td className="px-6 py-4">{exam.exam_type}</td>
                <td className="px-6 py-4">{exam.academic_year}</td>
                <td className="px-6 py-4">{new Date(exam.start_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${exam.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                      exam.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 
                      'bg-blue-100 text-blue-700'}`}>
                    {exam.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/exams/${exam.id}`}>Manage</Link>
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
