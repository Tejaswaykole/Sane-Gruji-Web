"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function StudentResultsPage() {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, user } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;
    
    // In a real app we would derive the studentId from the user context, or use a /me endpoint that fetches their own marks
    // For MVP, we will fetch marks without student ID and filter manually, or pass studentId if available
    const fetchResults = async () => {
      try {
        // Ideally: /marks/my-results or /marks?studentId=...
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marks`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        
        // Filter out marks where exam status isn't COMPLETED or PUBLISHED
        // For MVP, we'll just display them, assuming backend only returns published marks
        setMarks(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [accessToken]);

  // Group marks by Exam
  const groupedMarks = marks.reduce((acc, mark) => {
    const examId = mark.exam?.id;
    if (!acc[examId]) acc[examId] = { exam: mark.exam, marks: [] };
    acc[examId].marks.push(mark);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Results</h1>
        <p className="text-slate-500">View your exam report cards and grades.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading results...</p>
      ) : Object.keys(groupedMarks).length === 0 ? (
        <p className="text-slate-500">No results found.</p>
      ) : (
        Object.values(groupedMarks).map((group: any) => {
          const totalObtained = group.marks.reduce((sum: number, m: any) => sum + m.marks_obtained, 0);
          const totalMax = group.marks.reduce((sum: number, m: any) => sum + m.total_marks, 0);
          const percentage = ((totalObtained / totalMax) * 100).toFixed(2);

          return (
            <div key={group.exam.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{group.exam.name}</h2>
                  <p className="text-sm text-slate-500">{group.exam.exam_type} | {group.exam.academic_year}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{percentage}%</div>
                  <div className="text-sm font-semibold text-slate-500">Overall Grade: {percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : percentage >= 40 ? 'D' : 'F'}</div>
                </div>
              </div>
              
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-100 text-slate-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Marks Obtained</th>
                    <th className="px-6 py-4">Total Marks</th>
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.marks.map((m: any) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{m.subject?.name}</td>
                      <td className="px-6 py-4">{m.marks_obtained}</td>
                      <td className="px-6 py-4">{m.total_marks}</td>
                      <td className="px-6 py-4 font-bold text-primary">{m.grade}</td>
                      <td className="px-6 py-4 text-slate-500">{m.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })
      )}
    </div>
  );
}
