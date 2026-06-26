"use client";

export default function StudentAttendancePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">My Attendance</h1>
        <p className="text-on-surface-variant">View your daily attendance records and history.</p>
      </div>

      <div className="glass-card p-8 rounded-xl border flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alice Johnson</h2>
          <p className="text-on-surface-variant">Grade 10-A | ADM-101</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-on-surface-variant uppercase">Overall Attendance</p>
          <p className="text-5xl font-bold text-primary">95%</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl border">
        <h3 className="font-semibold text-lg mb-4">Recent History</h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-variant text-on-surface-variant uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-6 py-4">2026-06-24</td>
              <td className="px-6 py-4"><span className="text-green-600 font-bold">PRESENT</span></td>
              <td className="px-6 py-4">-</td>
            </tr>
            <tr>
              <td className="px-6 py-4">2026-06-23</td>
              <td className="px-6 py-4"><span className="text-green-600 font-bold">PRESENT</span></td>
              <td className="px-6 py-4">-</td>
            </tr>
            <tr>
              <td className="px-6 py-4">2026-06-22</td>
              <td className="px-6 py-4"><span className="text-red-600 font-bold">ABSENT</span></td>
              <td className="px-6 py-4">Sick Leave</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
