"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";

interface Student {
  id: string;
  admission_no: string;
  first_name: string;
  last_name: string;
  class: { class_name: string; section: string };
  parent: { father_name: string; phone: string };
  status: string;
}

export default function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [classFilter, setClassFilter] = useState("");
  const [classes, setClasses] = useState<{id: string, class_name: string, section: string}[]>([]);
  const { accessToken } = useAuthStore();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  
  const limit = 10;

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/classes`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(console.error);
    }
  }, [accessToken]);

  const fetchStudents = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students?page=${page}&limit=${limit}&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}&classId=${classFilter}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.data) {
        setStudents(data.data);
        setTotalPages(data.meta.totalPages);
      } else {
        setStudents(data); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [accessToken, page, sortBy, sortOrder, classFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
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

  const handleBulkImport = async () => {
    if (!importFile || !accessToken) return;
    setImporting(true);
    const formData = new FormData();
    formData.append("file", importFile);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
      });
      if (res.ok) {
        alert("Students imported successfully!");
        setShowImportModal(false);
        fetchStudents();
      } else {
        alert("Import failed.");
      }
    } catch {
      alert("Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-slate-500">Manage admissions, student records, and parents.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            Bulk Import
          </Button>
          <Button asChild>
            <Link href="/admin/students/create">
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or admission no..." 
              className="pl-10" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={classFilter} 
            onChange={e => { setClassFilter(e.target.value); setPage(1); }}
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
            ))}
          </select>
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
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('admission_no')}>
                Admission No {sortBy === 'admission_no' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('first_name')}>
                Student Name {sortBy === 'first_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Parent Details</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading students...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">No students found.</td></tr>
            ) : students.map(student => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-primary">{student.admission_no}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{student.first_name} {student.last_name}</td>
                <td className="px-6 py-4 text-slate-700">{student.class?.class_name} - {student.class?.section}</td>
                <td className="px-6 py-4">
                  <div className="text-slate-900">{student.parent?.father_name}</div>
                  <div className="text-slate-500 text-xs">{student.parent?.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/students/${student.id}`}>View</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/students/${student.id}/edit`}>Edit</Link>
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

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Bulk Import Students</h2>
            <p className="text-slate-500 text-sm mb-4">Upload a CSV file containing student records.</p>
            <input type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded mb-6" />
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
              <Button onClick={handleBulkImport} disabled={!importFile || importing}>
                {importing ? "Importing..." : "Upload & Import"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
