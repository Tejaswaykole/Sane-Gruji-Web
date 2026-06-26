"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export default function FeeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [fee, setFee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const { accessToken } = useAuthStore();

  const fetchFee = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fees/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFee(data);
        setStatus(data.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) fetchFee();
  }, [accessToken, id]);

  const updateStatus = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fees/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert("Fee status updated successfully!");
        fetchFee();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const deleteFee = async () => {
    if (!confirm("Are you sure you want to delete this fee record?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        alert("Fee deleted");
        router.push("/admin/fees");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!fee) return <div className="p-8 text-center text-red-500">Fee record not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fee Ledger Details</h1>
          <p className="text-slate-500 mt-1">Record ID: {fee.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/admin/fees">Back</Link></Button>
          <Button variant="outline" asChild><Link href={`/admin/fees/${id}/edit`}>Edit Record</Link></Button>
          <Button variant="destructive" onClick={deleteFee}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-900 border-b pb-2">Record Information</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div><span className="text-slate-500 block">Student</span><span className="font-semibold text-primary">{fee.student?.first_name} {fee.student?.last_name}</span></div>
              <div><span className="text-slate-500 block">Admission No</span><span className="font-medium">{fee.student?.admission_no}</span></div>
              <div><span className="text-slate-500 block">Class</span><span className="font-medium">{fee.student?.class?.class_name} {fee.student?.class?.section}</span></div>
              <div><span className="text-slate-500 block">Academic Year</span><span className="font-medium">{fee.academic_year}</span></div>
              
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2"></div>
              
              <div><span className="text-slate-500 block">Fee Type</span><span className="font-medium">{fee.fee_type}</span></div>
              <div><span className="text-slate-500 block">Amount Due</span><span className="font-bold text-lg text-slate-900">${fee.amount.toFixed(2)}</span></div>
              <div><span className="text-slate-500 block">Due Date</span><span className="font-medium">{new Date(fee.due_date).toLocaleDateString()}</span></div>
              
              {fee.remarks && (
                <div className="col-span-2 mt-2">
                  <span className="text-slate-500 block mb-1 text-sm">Remarks</span>
                  <p className="bg-slate-50 p-3 rounded-lg text-slate-700 text-sm">{fee.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-900 border-b pb-2">Status Management</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Current Status</label>
                <select 
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold
                    ${status === 'CLEARED' ? 'text-green-700' : status === 'OVERDUE' ? 'text-red-700' : status === 'PENDING' ? 'text-yellow-700' : 'text-slate-700'}`}
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CLEARED">Cleared</option>
                  <option value="WAIVED">Waived</option>
                </select>
              </div>

              <Button className="w-full" onClick={updateStatus} disabled={saving || status === fee.status}>
                {saving ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
