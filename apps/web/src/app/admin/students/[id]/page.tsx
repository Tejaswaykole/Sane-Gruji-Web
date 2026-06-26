"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";

export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const { accessToken } = useAuthStore();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (accessToken && id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setStudent(data))
      .catch(console.error);
    }
  }, [id, accessToken]);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", "General");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${id}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
      });
      if (res.ok) alert("Document uploaded via Supabase!");
      else alert("Upload failed");
    } catch {
      alert("Upload failed");
    }
  };

  if (!student) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-on-surface">Student Profile</h1>
        <Button variant="outline" asChild><Link href="/admin/students">Back to List</Link></Button>
      </div>

      <div className="glass-card rounded-xl p-8 border flex gap-8 items-start">
        <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center text-4xl text-primary font-bold overflow-hidden">
          {student.photo ? <img src={student.photo} alt="Avatar" className="w-full h-full object-cover" /> : `${student.first_name[0]}${student.last_name[0]}`}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-on-surface">{student.first_name} {student.last_name}</h2>
          <p className="text-on-surface-variant flex items-center gap-2 mt-1">
            <span className="font-semibold">Adm No:</span> {student.admission_no}
          </p>
          <div className="flex gap-4 mt-6">
            <div className="px-4 py-2 bg-surface-variant rounded-lg">
              <div className="text-xs text-on-surface-variant uppercase font-semibold">Class</div>
              <div className="font-medium">{student.class?.class_name} - {student.class?.section}</div>
            </div>
            <div className="px-4 py-2 bg-surface-variant rounded-lg">
              <div className="text-xs text-on-surface-variant uppercase font-semibold">Status</div>
              <div className="font-medium text-green-600">{student.status}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b flex gap-8">
        {['overview', 'academic', 'parent', 'documents', 'attendance'].map(t => (
          <button 
            key={t}
            className={`py-4 border-b-2 font-medium transition-colors capitalize ${tab === t ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`} 
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl p-8 border min-h-[300px]">
        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-8">
            <div><h3 className="font-semibold text-slate-500 mb-2">DOB</h3><p className="text-slate-900">{new Date(student.dob).toLocaleDateString()}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Gender</h3><p className="text-slate-900">{student.gender}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Blood Group</h3><p className="text-slate-900">{student.blood_group || 'N/A'}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Phone</h3><p className="text-slate-900">{student.phone || 'N/A'}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Email</h3><p className="text-slate-900">{student.email || 'N/A'}</p></div>
            <div className="col-span-2"><h3 className="font-semibold text-slate-500 mb-2">Address</h3><p className="text-slate-900">{student.address || 'N/A'}</p></div>
          </div>
        )}

        {tab === 'academic' && (
          <div className="grid grid-cols-2 gap-8">
            <div><h3 className="font-semibold text-slate-500 mb-2">Admission Date</h3><p className="text-slate-900">{new Date(student.admission_date).toLocaleDateString()}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Admission Number</h3><p className="text-slate-900">{student.admission_no}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Class</h3><p className="text-slate-900">{student.class?.class_name}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Section</h3><p className="text-slate-900">{student.class?.section}</p></div>
          </div>
        )}

        {tab === 'parent' && (
          <div className="grid grid-cols-2 gap-8">
            <div><h3 className="font-semibold text-on-surface-variant mb-2">Father's Name</h3><p>{student.parent?.father_name || 'N/A'}</p></div>
            <div><h3 className="font-semibold text-on-surface-variant mb-2">Phone</h3><p>{student.parent?.phone || 'N/A'}</p></div>
          </div>
        )}

        {tab === 'documents' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Uploaded Documents</h3>
              <div>
                <input type="file" id="docUpload" className="hidden" onChange={handleDocumentUpload} />
                <label htmlFor="docUpload">
                  <Button variant="outline" asChild>
                    <span>Upload Document (Supabase Storage)</span>
                  </Button>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              {student.documents?.length === 0 ? <p className="text-on-surface-variant">No documents uploaded.</p> : 
                student.documents?.map((doc: any) => (
                  <div key={doc.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="font-medium">{doc.document_type}</span>
                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View File</a>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {tab === 'attendance' && (
          <StudentAttendanceTab studentId={id as string} />
        )}
      </div>
    </div>
  );
}

function StudentAttendanceTab({ studentId }: { studentId: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const { accessToken } = useAuthStore();
  const date = new Date();

  useEffect(() => {
    if (accessToken) {
      // Fetch for current month
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/student/${studentId}?month=${date.getMonth() + 1}&year=${date.getFullYear()}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(console.error);
    }
  }, [accessToken, studentId]);

  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const totalCount = records.length;
  const pct = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">Current Month Attendance</h3>
        <p className={`text-4xl font-bold ${pct >= 75 ? 'text-green-600' : 'text-red-600'}`}>{pct}%</p>
      </div>
      <h4 className="font-semibold mt-6 text-slate-900">Recent Records</h4>
      {records.length === 0 ? (
        <p className="text-slate-500">No attendance records found for this month.</p>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-medium">
              <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.slice().reverse().map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{new Date(r.attendance_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold 
                      ${r.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 
                        r.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
