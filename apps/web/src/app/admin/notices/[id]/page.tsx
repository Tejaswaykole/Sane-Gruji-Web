"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { FileText, Calendar, Users, Target } from "lucide-react";

export default function NoticeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  const fetchNotice = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) setNotice(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) fetchNotice();
  }, [accessToken, id]);

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setNotice({ ...notice, status });
        alert(`Notice marked as ${status}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const deleteNotice = async () => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        alert("Deleted successfully");
        router.push("/admin/notices");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!notice) return <div className="p-8 text-center text-red-500">Notice not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{notice.title}</h1>
          <div className="flex items-center gap-4 mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold 
              ${notice.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                notice.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 
                notice.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700' : 
                'bg-red-100 text-red-700'}`}>
              {notice.status}
            </span>
            <span className="text-slate-500 text-sm font-medium bg-slate-100 px-3 py-1 rounded-full">
              {notice.category}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/admin/notices">Back</Link></Button>
          {notice.status === 'DRAFT' && <Button onClick={() => updateStatus('PUBLISHED')} className="bg-green-600 hover:bg-green-700">Publish</Button>}
          {notice.status === 'PUBLISHED' && <Button onClick={() => updateStatus('ARCHIVED')} variant="secondary">Archive</Button>}
          {notice.status === 'PUBLISHED' && <Button onClick={() => updateStatus('EXPIRED')} variant="secondary">Expire</Button>}
          <Button variant="destructive" onClick={deleteNotice}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Content
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">
              {notice.content}
            </p>
          </div>

          {notice.attachment_url && (
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Attachment</h3>
              <a href={notice.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                View Attached File
              </a>
            </div>
          )}
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" /> Targeting
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs text-slate-400 font-semibold mb-1">ROLES</span>
                <div className="flex flex-wrap gap-2">
                  {notice.target_roles?.map((role: string) => (
                    <span key={role} className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              
              {notice.target_classes?.length > 0 && (
                <div>
                  <span className="block text-xs text-slate-400 font-semibold mb-1">CLASSES</span>
                  <div className="flex flex-wrap gap-2">
                    {notice.target_classes.map((clsId: string) => (
                      <span key={clsId} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-2 py-1 rounded">
                        Class ID: {clsId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Dates & Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Publish Date</span>
                <span className="font-semibold text-slate-900">{notice.publish_date ? new Date(notice.publish_date).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Expiry Date</span>
                <span className="font-semibold text-slate-900">{notice.expiry_date ? new Date(notice.expiry_date).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Created By</span>
                <span className="font-semibold text-slate-900">{notice.creator?.first_name} {notice.creator?.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created At</span>
                <span className="font-semibold text-slate-900">{new Date(notice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
