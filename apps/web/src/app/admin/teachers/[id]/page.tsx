"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";

export default function TeacherProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const { accessToken } = useAuthStore();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (accessToken && id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setTeacher(data))
      .catch(console.error);
    }
  }, [id, accessToken]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      router.push("/admin/teachers");
    } catch (e) {
      alert("Failed to delete teacher");
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ status })
      });
      setTeacher({ ...teacher, status });
    } catch (e) {
      alert("Failed to update status");
    }
  };

  if (!teacher) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Teacher Profile</h1>
        <div className="flex gap-4">
          <Button variant="outline" asChild><Link href="/admin/teachers">Back to List</Link></Button>
          <Button variant="destructive" onClick={handleDelete}>Delete Teacher</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex gap-8 items-start">
        <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-4xl text-indigo-600 font-bold overflow-hidden">
          {teacher.photo ? <img src={teacher.photo} alt="Avatar" className="w-full h-full object-cover" /> : `${teacher.first_name[0]}${teacher.last_name[0]}`}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">{teacher.first_name} {teacher.last_name}</h2>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <span className="font-semibold text-slate-700">Emp ID:</span> {teacher.employee_id}
          </p>
          <div className="flex gap-4 mt-6">
            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 uppercase font-semibold">User Account</div>
              <div className="font-medium text-slate-900">{teacher.user ? 'Linked' : 'Not Linked'}</div>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 uppercase font-semibold">Status</div>
              <div className="font-medium text-green-600">{teacher.status}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b flex gap-8">
        {['overview', 'employment', 'classes'].map(t => (
          <button 
            key={t}
            className={`py-4 border-b-2 font-medium transition-colors capitalize ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`} 
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm min-h-[300px]">
        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-8">
            <div><h3 className="font-semibold text-slate-500 mb-2">DOB</h3><p className="text-slate-900">{new Date(teacher.dob).toLocaleDateString()}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Gender</h3><p className="text-slate-900">{teacher.gender}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Phone</h3><p className="text-slate-900">{teacher.phone || 'N/A'}</p></div>
            <div><h3 className="font-semibold text-slate-500 mb-2">Email</h3><p className="text-slate-900">{teacher.email || 'N/A'}</p></div>
            <div className="col-span-2"><h3 className="font-semibold text-slate-500 mb-2">Address</h3><p className="text-slate-900">{teacher.address || 'N/A'}</p></div>
          </div>
        )}

        {tab === 'employment' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div><h3 className="font-semibold text-slate-500 mb-2">Joining Date</h3><p className="text-slate-900">{new Date(teacher.joining_date).toLocaleDateString()}</p></div>
              <div><h3 className="font-semibold text-slate-500 mb-2">Qualification</h3><p className="text-slate-900">{teacher.qualification || 'N/A'}</p></div>
              <div><h3 className="font-semibold text-slate-500 mb-2">Experience</h3><p className="text-slate-900">{teacher.experience ? `${teacher.experience} years` : 'N/A'}</p></div>
            </div>
            
            <hr className="border-slate-100" />
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-slate-900">Employment Status</h3>
              <div className="flex gap-4">
                <Button variant={teacher.status === 'ACTIVE' ? 'default' : 'outline'} onClick={() => handleStatusChange('ACTIVE')}>Active</Button>
                <Button variant={teacher.status === 'INACTIVE' ? 'default' : 'outline'} onClick={() => handleStatusChange('INACTIVE')}>Inactive</Button>
                <Button variant={teacher.status === 'RESIGNED' ? 'destructive' : 'outline'} onClick={() => handleStatusChange('RESIGNED')}>Resigned</Button>
              </div>
            </div>
          </div>
        )}

        {tab === 'classes' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Assigned Classes</h3>
            {!teacher.classes || teacher.classes.length === 0 ? (
              <p className="text-slate-500">No classes assigned.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {teacher.classes.map((tc: any) => (
                  <div key={tc.class_id} className="p-4 border rounded-lg bg-slate-50 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{tc.class.class_name} - {tc.class.section}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/classes/${tc.class_id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 pt-6 border-t">Assigned Subjects</h3>
            {!teacher.subjects || teacher.subjects.length === 0 ? (
              <p className="text-slate-500">No subjects assigned.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {teacher.subjects.map((ts: any) => (
                  <div key={ts.subject_id} className="p-4 border rounded-lg bg-slate-50">
                    <span className="font-semibold text-slate-800">{ts.subject.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
