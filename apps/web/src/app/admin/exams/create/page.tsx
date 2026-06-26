"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

const examSchema = z.object({
  name: z.string().min(1, "Name is required"),
  exam_type: z.string().min(1, "Type is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required")
});

export default function CreateExamPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof examSchema>>({
    resolver: zodResolver(examSchema),
  });
  
  const [submitting, setSubmitting] = useState(false);
  const { accessToken } = useAuthStore();
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof examSchema>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ...data, status: "DRAFT" }),
      });
      
      if (!res.ok) throw new Error("Failed to create exam");
      const exam = await res.json();
      alert("Exam created successfully!");
      router.push(`/admin/exams/${exam.id}`);
    } catch (e) {
      console.error(e);
      alert("Error creating exam");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Create New Exam</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-slate-700">Exam Name</label>
            <Input {...register("name")} placeholder="e.g. Mid-Term Examination 2026" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Exam Type</label>
            <select {...register("exam_type")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select Type...</option>
              <option value="MID_TERM">Mid Term</option>
              <option value="FINAL">Final</option>
              <option value="UNIT_TEST">Unit Test</option>
            </select>
            {errors.exam_type && <p className="text-red-500 text-xs mt-1">{errors.exam_type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Academic Year</label>
            <select {...register("academic_year")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select Year...</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
            {errors.academic_year && <p className="text-red-500 text-xs mt-1">{errors.academic_year.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Start Date</label>
            <Input type="date" {...register("start_date")} />
            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">End Date</label>
            <Input type="date" {...register("end_date")} />
            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Save Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
