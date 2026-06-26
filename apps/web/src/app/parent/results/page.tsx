"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function ParentResultsPage() {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;
    
    // For MVP, parents can view their children's marks. We will fetch all marks accessible to this user.
    const fetchResults = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marks`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        setMarks(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [accessToken]);

  // Group marks by Student, then by Exam
  const groupedByStudent = marks.reduce((acc, mark) => {
    const studentId = mark.student?.id;
    if (!studentId) return acc;
    if (!acc[studentId]) acc[studentId] = { student: mark.student, exams: {} };
    
    const examId = mark.exam?.id;
    if (!acc[studentId].exams[examId]) acc[studentId].exams[examId] = { exam: mark.exam, marks: [] };
    
    acc[studentId].exams[examId].marks.push(mark);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Children's Results</h1>
        <p className="text-slate-500">View exam report cards and grades for your children.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading results...</p>
      ) : Object.keys(groupedByStudent).length === 0 ? (
        <p className="text-slate-500">No results found.</p>
      ) : (
        Object.values(groupedByStudent).map((group: any) => (
          <div key={group.student.id} className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-2 rounded-lg">Student: {group.student.first_name} {group.student.last_name}</span>
            </h2>

            {Object.values(group.exams).map((examGroup: any) => {
              const totalObtained = examGroup.marks.reduce((sum: number, m: any) => sum + m.marks_obtained, 0);
              const totalMax = examGroup.marks.reduce((sum: number, m: any) => sum + m.total_marks, 0);
              const percentage = ((totalObtained / totalMax) * 100).toFixed(2);

              return (
                <div key={examGroup.exam.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ml-6">
                  <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{examGroup.exam.name}</h3>
                      <p className="text-sm text-slate-500">{examGroup.exam.exam_type} | {examGroup.exam.academic_year}</p>
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
                      {examGroup.marks.map((m: any) => (
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
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
