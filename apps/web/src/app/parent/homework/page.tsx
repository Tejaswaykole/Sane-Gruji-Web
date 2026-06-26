"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function ParentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, user } = useAuthStore();

  useEffect(() => {
    // For MVP, we fetch all PUBLISHED homeworks.
    // Ideally, filter by children's classes.
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
        <h1 className="text-3xl font-bold text-slate-900">Children's Homework</h1>
        <p className="text-slate-500">Keep track of assigned homework.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Attachment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">Loading homeworks...</td></tr>
            ) : homeworks.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">No homework found.</td></tr>
            ) : homeworks.map(hw => (
              <tr key={hw.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{hw.title}</td>
                <td className="px-6 py-4">{hw.subject?.name}</td>
                <td className="px-6 py-4">{hw.class?.class_name} - {hw.class?.section}</td>
                <td className="px-6 py-4 text-red-600 font-semibold">{new Date(hw.due_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {hw.attachment_url ? (
                    <a href={hw.attachment_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Download</a>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
