"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

const feeSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  academic_year: z.string().min(1, "Academic Year is required"),
  fee_type: z.string().min(1, "Fee Type is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  due_date: z.string().min(1, "Due Date is required"),
  remarks: z.string().optional()
});

export default function CreateFeePage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof feeSchema>>({
    resolver: zodResolver(feeSchema),
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const { accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
      // In a real app we'd probably use a searchable dropdown, but for MVP we fetch all active students
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => { if (data.data) setStudents(data.data); })
      .catch(console.error);
    }
  }, [accessToken]);

  const onSubmit = async (data: z.infer<typeof feeSchema>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fees`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Failed to log fee");
      alert("Fee record created successfully!");
      router.push("/admin/fees");
    } catch (e) {
      console.error(e);
      alert("Error logging fee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Log New Fee Record</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-slate-700">Student</label>
            <select {...register("student_id")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select Student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_no})</option>
              ))}
            </select>
            {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Academic Year</label>
            <select {...register("academic_year")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select Year...</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
            {errors.academic_year && <p className="text-red-500 text-xs mt-1">{errors.academic_year.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Fee Type</label>
            <select {...register("fee_type")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select Fee Type...</option>
              <option value="Tuition Fee">Tuition Fee</option>
              <option value="Transport Fee">Transport Fee</option>
              <option value="Library Fee">Library Fee</option>
              <option value="Extracurricular">Extracurricular Fee</option>
              <option value="Late Fine">Late Fine</option>
            </select>
            {errors.fee_type && <p className="text-red-500 text-xs mt-1">{errors.fee_type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Amount ($)</label>
            <Input type="number" step="0.01" {...register("amount")} placeholder="e.g. 1500.00" />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Due Date</label>
            <Input type="date" {...register("due_date")} />
            {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date.message}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-slate-700">Remarks (Optional)</label>
            <textarea 
              {...register("remarks")} 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Any specific notes about this fee..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Log Fee"}
          </Button>
        </div>
      </form>
    </div>
  );
}
