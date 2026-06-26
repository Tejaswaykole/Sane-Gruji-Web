"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

export default function MarksEntryPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { accessToken, user } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;
    
    // Fetch active exams
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams?status=PUBLISHED`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => res.json())
    .then(data => { if (data.data) setExams(data.data); })
    .catch(console.error);

    // Fetch classes and subjects for this teacher
    if (user?.teacherProfile?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${user.teacherProfile.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.classes) setClasses(data.classes.map((c: any) => c.class));
        if (data.subjects) setSubjects(data.subjects.map((s: any) => s.subject));
      })
      .catch(console.error);
    }
  }, [accessToken, user]);

  const loadRoster = async () => {
    if (!selectedExam || !selectedClass || !selectedSubject) {
      alert("Please select exam, class, and subject");
      return;
    }
    
    setLoading(true);
    try {
      // Fetch students for the class
      const stuRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/classes/${selectedClass}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const stuData = await stuRes.json();
      
      // Fetch existing marks
      const marksRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marks?examId=${selectedExam}&classId=${selectedClass}&subjectId=${selectedSubject}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const existingMarks = await marksRes.json();
      
      const marksMap: Record<string, any> = {};
      stuData.forEach((student: any) => {
        const exist = existingMarks.find((m: any) => m.student_id === student.id);
        marksMap[student.id] = {
          student_id: student.id,
          marks_obtained: exist ? exist.marks_obtained : "",
          total_marks: exist ? exist.total_marks : 100,
          remarks: exist ? exist.remarks || "" : ""
        };
      });
      
      setStudents(stuData);
      setMarksData(marksMap);
    } catch (e) {
      console.error(e);
      alert("Error loading roster");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, field: string, value: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const saveMarks = async () => {
    setSaving(true);
    try {
      const payload = Object.values(marksData).filter(m => m.marks_obtained !== "");
      if (payload.length === 0) {
        alert("No marks entered");
        return;
      }
      
      const enrichedPayload = payload.map(p => ({
        ...p,
        subject_id: selectedSubject
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({
          exam_id: selectedExam,
          marks: enrichedPayload
        })
      });

      if (res.ok) {
        alert("Marks saved successfully!");
      } else {
        alert("Failed to save marks");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving marks");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Marks Entry</h1>
        <p className="text-slate-500">Enter student marks for your assigned subjects.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-slate-700">Exam</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
            <option value="">Select Exam...</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-slate-700">Class</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">Select Class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-slate-700">Subject</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            <option value="">Select Subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        
        <Button onClick={loadRoster} disabled={loading}>{loading ? "Loading..." : "Load Roster"}</Button>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Admission No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Marks Obtained</th>
                <th className="px-6 py-4">Total Marks</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{student.admission_no}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{student.first_name} {student.last_name}</td>
                  <td className="px-6 py-4">
                    <Input 
                      type="number" 
                      className="w-24"
                      value={marksData[student.id]?.marks_obtained || ""}
                      onChange={e => handleMarkChange(student.id, 'marks_obtained', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Input 
                      type="number" 
                      className="w-24 bg-slate-50"
                      value={marksData[student.id]?.total_marks || 100}
                      onChange={e => handleMarkChange(student.id, 'total_marks', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Input 
                      placeholder="Optional remarks"
                      value={marksData[student.id]?.remarks || ""}
                      onChange={e => handleMarkChange(student.id, 'remarks', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <Button onClick={saveMarks} disabled={saving}>{saving ? "Saving..." : "Save Marks"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
