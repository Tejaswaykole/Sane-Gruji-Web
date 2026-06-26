"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function StudentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, user } = useAuthStore();

  useEffect(() => {
    // In MVP, we might need student's class_id to filter homeworks
    // Assume user object has it or we just fetch PUBLISHED homeworks for the student's class.
    // For simplicity, we just fetch with status=PUBLISHED. The backend or a query parameter would normally filter by class_id.
    const fetchHomeworks = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework?status=PUBLISHED`, {
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
    if (accessToken) {
      fetchHomeworks();
    }
  }, [accessToken, user]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Homework</h1>
        <p className="text-slate-500">View and download your assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500">Loading homeworks...</p>
        ) : homeworks.length === 0 ? (
          <p className="text-slate-500">No pending homework assignments.</p>
        ) : homeworks.map(hw => (
          <div key={hw.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{hw.subject?.name}</span>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                Due: {new Date(hw.due_date).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{hw.title}</h2>
            <p className="text-slate-600 text-sm flex-1 line-clamp-3">{hw.description}</p>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <div className="text-xs text-slate-500">
                Teacher: {hw.teacher?.first_name} {hw.teacher?.last_name}
              </div>
              {hw.attachment_url && (
                <a href={hw.attachment_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">
                  View File
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
