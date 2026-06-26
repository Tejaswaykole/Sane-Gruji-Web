"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

const homeworkEditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  class_id: z.string().min(1, "Class is required"),
  subject_id: z.string().min(1, "Subject is required"),
  due_date: z.string().min(1, "Due date is required"),
});

export default function EditHomeworkPage() {
  const { id } = useParams();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof homeworkEditSchema>>({
    resolver: zodResolver(homeworkEditSchema),
  });
  
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [hw, setHw] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const { accessToken, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (accessToken && id) {
      // Fetch homework details
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => {
        setHw(data);
        reset({
          title: data.title,
          description: data.description,
          class_id: data.class_id,
          subject_id: data.subject_id,
          due_date: new Date(data.due_date).toISOString().split('T')[0]
        });
      })
      .catch(console.error);
      
      // Fetch classes and subjects
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
    }
  }, [accessToken, user, id, reset]);

  const onSubmit = async (data: z.infer<typeof homeworkEditSchema>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Failed to update homework");
      
      alert("Homework updated successfully!");
      router.push(`/teacher/homework/${id}`);
    } catch (e) {
      console.error(e);
      alert("Error updating homework");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hw) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Edit Homework</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-slate-700">Title</label>
            <Input {...register("title")} placeholder="e.g. Algebra Chapter 4 Practice" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Class</label>
            <select {...register("class_id")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select Class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
              ))}
            </select>
            {errors.class_id && <p className="text-red-500 text-xs mt-1">{errors.class_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Subject</label>
            <select {...register("subject_id")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select Subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.subject_id && <p className="text-red-500 text-xs mt-1">{errors.subject_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Due Date</label>
            <Input type="date" {...register("due_date")} />
            {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date.message}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-slate-700">Description</label>
            <textarea 
              {...register("description")} 
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Enter homework instructions..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
