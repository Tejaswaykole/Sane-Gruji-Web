"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export default function InquiryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Follow-up state
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const { accessToken } = useAuthStore();

  const fetchInquiry = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admissions/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInquiry(data);
        setStatus(data.status);
        setRemarks(data.remarks || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) fetchInquiry();
  }, [accessToken, id]);

  const saveUpdates = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admissions/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ status, remarks })
      });
      if (res.ok) {
        alert("Inquiry updated successfully!");
        fetchInquiry();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update inquiry");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!inquiry) return <div className="p-8 text-center text-red-500">Inquiry not found</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inquiry: {inquiry.student_name}</h1>
          <p className="text-slate-500 mt-1">Submitted on {new Date(inquiry.createdAt).toLocaleDateString()}</p>
        </div>
        <Button variant="outline" asChild><Link href="/admission-officer/inquiries">Back to List</Link></Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-900 border-b pb-2">Applicant Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block">Student Name</span><span className="font-medium">{inquiry.student_name}</span></div>
              <div><span className="text-slate-500 block">Grade Applying For</span><span className="font-medium">{inquiry.grade_applying}</span></div>
              <div><span className="text-slate-500 block">Parent/Guardian Name</span><span className="font-medium">{inquiry.parent_name}</span></div>
              <div><span className="text-slate-500 block">Contact Phone</span><span className="font-medium">{inquiry.phone}</span></div>
              <div><span className="text-slate-500 block">Contact Email</span><span className="font-medium">{inquiry.email}</span></div>
              <div><span className="text-slate-500 block">Source</span><span className="font-medium">{inquiry.source || 'Website'}</span></div>
            </div>
            
            {inquiry.message && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-slate-500 block mb-2 text-sm">Message from Parent</span>
                <p className="bg-slate-50 p-4 rounded-lg text-slate-700 italic text-sm">{inquiry.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-900 border-b pb-2">Status & Follow-up</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Current Status</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="ADMISSION_COMPLETED">Admission Completed</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Internal Remarks / Notes</label>
                <textarea 
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                  placeholder="Log your call notes, follow-up dates, etc..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={saveUpdates} disabled={saving}>
                {saving ? "Saving..." : "Save Updates"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
