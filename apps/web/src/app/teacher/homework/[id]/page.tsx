"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export default function HomeworkDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hw, setHw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  const fetchHomework = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) setHw(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) {
      fetchHomework();
    }
  }, [accessToken, id]);

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setHw({ ...hw, status });
        alert(`Homework marked as ${status}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const deleteHomework = async () => {
    if (!confirm("Are you sure you want to delete this homework?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        alert("Deleted successfully");
        router.push("/teacher/homework");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!hw) return <div className="p-8 text-center text-red-500">Homework not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{hw.title}</h1>
          <div className="flex gap-4 mt-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${hw.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : hw.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
              {hw.status}
            </span>
            <span className="text-slate-500 text-sm">Due: {new Date(hw.due_date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/teacher/homework">Back</Link></Button>
          <Button variant="outline" asChild><Link href={`/teacher/homework/${hw.id}/edit`}>Edit</Link></Button>
          {hw.status === 'DRAFT' && <Button onClick={() => updateStatus('PUBLISHED')} className="bg-green-600 hover:bg-green-700">Publish</Button>}
          {hw.status === 'PUBLISHED' && <Button onClick={() => updateStatus('CLOSED')} variant="secondary">Close</Button>}
          <Button variant="destructive" onClick={deleteHomework}>Delete</Button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Class</h3>
            <p className="text-slate-900 font-medium mt-1">{hw.class?.class_name} - {hw.class?.section}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Subject</h3>
            <p className="text-slate-900 font-medium mt-1">{hw.subject?.name}</p>
          </div>
          <div className="col-span-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Description</h3>
            <p className="text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed">{hw.description}</p>
          </div>
          {hw.attachment_url && (
            <div className="col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Attachment</h3>
              <a href={hw.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors">
                View Attached File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
