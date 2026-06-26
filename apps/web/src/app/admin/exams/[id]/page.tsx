"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

export default function ExamDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();
  
  // For scheduling
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    class_id: "", subject_id: "", exam_date: "", start_time: "", end_time: "", room: ""
  });

  const fetchExam = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) setExam(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const classRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/classes`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (classRes.ok) setClasses(await classRes.json());
      
      // For MVP, if there's no dedicated subjects endpoint, we could either mock or rely on teacher subjects, 
      // but an admin needs all subjects. Actually, let's assume we can add a simple generic Subject fetcher or just mock it.
      // Wait, there's no generic GET /subjects yet. Let's assume there are subjects returned or we just use mock data if empty.
      setSubjects([{ id: 'mock-math', name: 'Mathematics' }, { id: 'mock-sci', name: 'Science' }]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (accessToken && id) {
      fetchExam();
      fetchDropdowns();
    }
  }, [accessToken, id]);

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setExam({ ...exam, status });
        alert(`Exam marked as ${status}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const addSchedule = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams/${id}/schedules`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify(newSchedule)
      });
      if (res.ok) {
        alert("Schedule added");
        fetchExam(); // refresh
      } else {
        alert("Failed to add schedule");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeSchedule = async (scheduleId: string) => {
    if (!confirm("Remove this schedule?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        fetchExam();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!exam) return <div className="p-8 text-center text-red-500">Exam not found</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{exam.name}</h1>
          <div className="flex gap-4 mt-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${exam.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : exam.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-700'}`}>
              {exam.status}
            </span>
            <span className="text-slate-500 text-sm">{exam.exam_type} | {exam.academic_year}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/admin/exams">Back</Link></Button>
          {exam.status === 'DRAFT' && <Button onClick={() => updateStatus('PUBLISHED')} className="bg-green-600 hover:bg-green-700">Publish</Button>}
          {exam.status === 'PUBLISHED' && <Button onClick={() => updateStatus('COMPLETED')} variant="secondary">Close Exam</Button>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-900">Exam Details</h3>
            <div className="space-y-4 text-sm">
              <div><span className="text-slate-500 block">Start Date</span><span className="font-medium text-slate-900">{new Date(exam.start_date).toLocaleDateString()}</span></div>
              <div><span className="text-slate-500 block">End Date</span><span className="font-medium text-slate-900">{new Date(exam.end_date).toLocaleDateString()}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-900">Add Schedule</h3>
            <div className="space-y-4">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newSchedule.class_id} onChange={e => setNewSchedule({...newSchedule, class_id: e.target.value})}>
                <option value="">Select Class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
              </select>
              
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newSchedule.subject_id} onChange={e => setNewSchedule({...newSchedule, subject_id: e.target.value})}>
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              
              <Input type="date" value={newSchedule.exam_date} onChange={e => setNewSchedule({...newSchedule, exam_date: e.target.value})} />
              
              <div className="flex gap-2">
                <Input type="time" placeholder="Start" value={newSchedule.start_time} onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})} />
                <Input type="time" placeholder="End" value={newSchedule.end_time} onChange={e => setNewSchedule({...newSchedule, end_time: e.target.value})} />
              </div>
              
              <Input placeholder="Room (optional)" value={newSchedule.room} onChange={e => setNewSchedule({...newSchedule, room: e.target.value})} />
              
              <Button className="w-full" onClick={addSchedule}>Add to Schedule</Button>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-900">Exam Timetable</h3>
            {exam.schedules?.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No subjects scheduled yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-medium">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exam.schedules?.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{new Date(s.exam_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{s.start_time} - {s.end_time}</td>
                        <td className="px-4 py-3">{s.class?.class_name} {s.class?.section}</td>
                        <td className="px-4 py-3">{s.subject?.name}</td>
                        <td className="px-4 py-3">{s.room || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeSchedule(s.id)}>Remove</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
