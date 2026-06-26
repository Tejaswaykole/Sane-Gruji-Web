"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;
    
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices`, {
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
    fetchNotices();
  }, [accessToken]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Student Notice Board</h1>
        <p className="text-slate-500">Stay updated with the latest school news and class announcements.</p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <p className="text-slate-500">Loading notices...</p>
        ) : notices.length === 0 ? (
          <p className="text-slate-500">No notices found.</p>
        ) : notices.map(notice => (
          <div key={notice.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${notice.category === 'EMERGENCY' ? 'bg-red-500' : 'bg-blue-500'}`} />
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{notice.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${notice.category === 'EMERGENCY' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {notice.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Posted: {new Date(notice.publish_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {notice.attachment_url && (
                <a href={notice.attachment_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg">
                  View Attachment
                </a>
              )}
            </div>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {notice.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
