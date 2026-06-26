"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";

interface Teacher {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  status: string;
}

export default function TeachersListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const { accessToken } = useAuthStore();
  
  const limit = 10;

  const fetchTeachers = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers?page=${page}&limit=${limit}&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.data) {
        setTeachers(data.data);
        setTotalPages(data.meta.totalPages);
      } else {
        setTeachers(data); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [accessToken, page, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers();
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Teacher Directory</h1>
          <p className="text-slate-500">Manage teaching staff and class assignments.</p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/teachers/create">
              Add Teacher
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or employee ID..." 
              className="pl-10" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
          <Button type="button" variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('employee_id')}>
                Employee ID {sortBy === 'employee_id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('first_name')}>
                Teacher Name {sortBy === 'first_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">Loading teachers...</td></tr>
            ) : teachers.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">No teachers found.</td></tr>
            ) : teachers.map(teacher => (
              <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-primary">{teacher.employee_id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{teacher.first_name} {teacher.last_name}</td>
                <td className="px-6 py-4">
                  <div className="text-slate-900">{teacher.email}</div>
                  <div className="text-slate-500 text-xs">{teacher.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${teacher.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {teacher.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/teachers/${teacher.id}`}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="text-sm text-slate-500">Page {page} of {Math.max(1, totalPages)}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>
               Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
