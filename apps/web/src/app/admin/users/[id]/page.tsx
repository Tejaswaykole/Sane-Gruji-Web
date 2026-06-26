"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { accessToken } = useAuthStore();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (accessToken && id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(console.error);
    }
  }, [id, accessToken]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      router.push("/admin/users");
    } catch (e) {
      alert("Failed to delete user");
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ status })
      });
      setUser({ ...user, status });
    } catch (e) {
      alert("Failed to update status");
    }
  };

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-on-surface">User Profile</h1>
        <div className="flex gap-4">
          <Button variant="outline" asChild><Link href="/admin/users">Back to List</Link></Button>
          <Button variant="destructive" onClick={handleDelete}>Delete User</Button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-8 border flex gap-8 items-start">
        <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center text-4xl text-primary font-bold">
          {user.first_name[0]}{user.last_name[0]}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-on-surface">{user.first_name} {user.last_name}</h2>
          <p className="text-on-surface-variant flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-sm">mail</span> {user.email}
          </p>
          <div className="flex gap-4 mt-6">
            <div className="px-4 py-2 bg-surface-variant rounded-lg">
              <div className="text-xs text-on-surface-variant uppercase font-semibold">Role</div>
              <div className="font-medium">{user.role?.name || 'N/A'}</div>
            </div>
            <div className="px-4 py-2 bg-surface-variant rounded-lg">
              <div className="text-xs text-on-surface-variant uppercase font-semibold">Status</div>
              <div className="font-medium text-green-600">{user.status}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b flex gap-8">
        <button className={`py-4 border-b-2 font-medium transition-colors ${tab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`py-4 border-b-2 font-medium transition-colors ${tab === 'security' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`} onClick={() => setTab('security')}>Security</button>
        <button className={`py-4 border-b-2 font-medium transition-colors ${tab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`} onClick={() => setTab('activity')}>Activity Logs</button>
      </div>

      <div className="glass-card rounded-xl p-8 border min-h-[300px]">
        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-8">
            <div><h3 className="font-semibold text-on-surface-variant mb-2">Employee ID</h3><p>{user.employee_id || 'N/A'}</p></div>
            <div><h3 className="font-semibold text-on-surface-variant mb-2">Phone</h3><p>{user.phone || 'N/A'}</p></div>
            <div><h3 className="font-semibold text-on-surface-variant mb-2">Created At</h3><p>{new Date(user.createdAt).toLocaleDateString()}</p></div>
            <div><h3 className="font-semibold text-on-surface-variant mb-2">Last Login</h3><p>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p></div>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Account Status</h3>
              <div className="flex gap-4">
                <Button variant={user.status === 'ACTIVE' ? 'default' : 'outline'} onClick={() => handleStatusChange('ACTIVE')}>Active</Button>
                <Button variant={user.status === 'SUSPENDED' ? 'default' : 'outline'} onClick={() => handleStatusChange('SUSPENDED')}>Suspended</Button>
                <Button variant={user.status === 'INACTIVE' ? 'default' : 'outline'} onClick={() => handleStatusChange('INACTIVE')}>Inactive</Button>
              </div>
            </div>
            <hr />
            <div>
              <h3 className="text-lg font-bold mb-4">Password Management</h3>
              <Button variant="outline">Send Password Reset Link</Button>
            </div>
          </div>
        )}
        {tab === 'activity' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Activity Logs</h3>
            {!user.auditLogsTargeted || user.auditLogsTargeted.length === 0 ? (
              <p className="text-slate-500">No recent activity.</p>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                {user.auditLogsTargeted.map((log: any) => (
                  <div key={log.id} className="relative pl-6">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-primary rounded-full ring-4 ring-white" />
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-slate-800">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Performed by: {log.performer ? `${log.performer.first_name} ${log.performer.last_name}` : 'System'}
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="mt-2 text-xs bg-slate-100 p-2 rounded text-slate-600 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
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
