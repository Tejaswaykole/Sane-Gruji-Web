"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<{id: string, class_name: string, section: string}[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/classes`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(console.error);
    }
  }, [accessToken]);

  const loadRoster = async () => {
    if (!selectedClass || !accessToken) return;
    setLoading(true);
    try {
      // Fetch all students in the class
      const stuRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students?classId=${selectedClass}&limit=1000`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const stuData = await stuRes.json();
      const roster = stuData.data || [];

      // Fetch existing attendance for the date
      const attRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/class/${selectedClass}?date=${date}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const attData = await attRes.json();

      // Merge
      const merged = roster.map((student: any) => {
        const existing = attData.find((a: any) => a.student_id === student.id);
        return {
          id: student.id,
          admission_no: student.admission_no,
          name: `${student.first_name} ${student.last_name}`,
          status: existing ? existing.status : ""
        };
      });

      setStudents(merged);
    } catch (e) {
      console.error(e);
      alert("Failed to load roster");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (id: string, status: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const bulkMark = (status: string) => {
    setStudents(students.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    if (!accessToken) return;
    // Check if all are marked
    if (students.some(s => !s.status)) {
      if (!confirm("Some students are unmarked. Their attendance will not be saved. Continue?")) return;
    }

    setSaving(true);
    const recordsToSave = students
      .filter(s => s.status)
      .map(s => ({
        student_id: s.id,
        class_id: selectedClass,
        attendance_date: date,
        status: s.status,
        remarks: ""
      }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/mark`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ records: recordsToSave })
      });

      if (!res.ok) throw new Error("Failed");
      alert("Attendance saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Daily Attendance</h1>
        <p className="text-slate-500">Select class and date to mark attendance.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-end gap-6">
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium mb-2 text-slate-700">Class / Section</label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setStudents([]); }}
          >
            <option value="">Select Class...</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium mb-2 text-slate-700">Date</label>
          <input 
            type="date" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={date}
            onChange={(e) => { setDate(e.target.value); setStudents([]); }}
          />
        </div>
        <Button onClick={loadRoster} disabled={!selectedClass || loading}>
          {loading ? "Loading..." : "Load Roster"}
        </Button>
      </div>

      {students.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Student Roster</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => bulkMark("PRESENT")}>Mark All Present</Button>
              <Button variant="outline" size="sm" onClick={() => bulkMark("ABSENT")}>Mark All Absent</Button>
            </div>
          </div>

          <table className="w-full text-left text-sm mb-6">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Adm No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{student.admission_no}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{student.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateStatus(student.id, "PRESENT")}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${student.status === "PRESENT" ? "bg-green-100 text-green-700 border-green-200" : "bg-white text-slate-500 hover:bg-slate-100"}`}>
                        PRESENT
                      </button>
                      <button 
                        onClick={() => updateStatus(student.id, "ABSENT")}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${student.status === "ABSENT" ? "bg-red-100 text-red-700 border-red-200" : "bg-white text-slate-500 hover:bg-slate-100"}`}>
                        ABSENT
                      </button>
                      <button 
                        onClick={() => updateStatus(student.id, "LATE")}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${student.status === "LATE" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-white text-slate-500 hover:bg-slate-100"}`}>
                        LATE
                      </button>
                      <button 
                        onClick={() => updateStatus(student.id, "LEAVE")}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${student.status === "LEAVE" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white text-slate-500 hover:bg-slate-100"}`}>
                        LEAVE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
