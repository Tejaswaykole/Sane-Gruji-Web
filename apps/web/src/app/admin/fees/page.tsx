"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { Search, Plus } from "lucide-react";

export default function AdminFeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("2026-2027");

  const { accessToken } = useAuthStore();

  const fetchFees = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (statusFilter) queryParams.append("status", statusFilter);
      if (yearFilter) queryParams.append("academic_year", yearFilter);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fees?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.data) setFees(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [accessToken, searchTerm, statusFilter, yearFilter]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fee Management</h1>
          <p className="text-slate-500">Track and manage student fee records.</p>
        </div>
        <Button asChild>
          <Link href="/admin/fees/create">
            <Plus className="mr-2 h-4 w-4" /> Log Fee Record
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search student..." 
            className="pl-10" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
        >
          <option value="2025-2026">2025-2026</option>
          <option value="2026-2027">2026-2027</option>
          <option value="2027-2028">2027-2028</option>
        </select>

        <select 
          className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CLEARED">Cleared</option>
          <option value="WAIVED">Waived</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Fee Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-500">Loading fees...</td></tr>
            ) : fees.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-500">No fee records found.</td></tr>
            ) : fees.map(fee => (
              <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{fee.student?.first_name} {fee.student?.last_name}</div>
                  <div className="text-xs text-slate-500">{fee.student?.admission_no}</div>
                </td>
                <td className="px-6 py-4">{fee.student?.class?.class_name} {fee.student?.class?.section}</td>
                <td className="px-6 py-4">{fee.fee_type}</td>
                <td className="px-6 py-4 font-bold text-slate-900">${fee.amount.toFixed(2)}</td>
                <td className="px-6 py-4">{new Date(fee.due_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold 
                    ${fee.status === 'CLEARED' ? 'bg-green-100 text-green-700' : 
                      fee.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 
                      fee.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-slate-100 text-slate-700'}`}>
                    {fee.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/fees/${fee.id}`}>View</Link>
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
