"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

const homeworkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  class_id: z.string().min(1, "Class is required"),
  subject_id: z.string().min(1, "Subject is required"),
  due_date: z.string().min(1, "Due date is required")
    .refine((date) => new Date(date) >= new Date(new Date().setHours(0,0,0,0)), {
      message: "Due date must be today or in the future",
    }),
});

export default function CreateHomeworkPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof homeworkSchema>>({
    resolver: zodResolver(homeworkSchema),
  });
  
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { accessToken, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
      // In MVP, we can fetch all classes and subjects. 
      // Ideally, fetch only classes and subjects assigned to this teacher.
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/classes`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(console.error);
      
      // Let's assume we have a /subjects endpoint or we can mock for now since we haven't built a subjects module
      // Wait, we DO have a Subject model, but no endpoint. 
      // I'll fetch teacher profile to get their assigned subjects and classes.
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
  }, [accessToken, user]);

  const onSubmit = async (data: z.infer<typeof homeworkSchema>) => {
    if (!user?.teacherProfile?.id) {
      alert("Only teachers can create homework.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ...data, teacher_id: user.teacherProfile.id, status: "DRAFT" }),
      });
      
      if (!res.ok) throw new Error("Failed to create homework");
      const hw = await res.json();

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework/${hw.id}/attachment`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData
        });
        if (!uploadRes.ok) {
          alert("Homework created but file upload failed.");
        }
      }

      alert("Homework created successfully!");
      router.push("/teacher/homework");
    } catch (e) {
      console.error(e);
      alert("Error creating homework");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedExtensions = ['pdf', 'docx', 'pptx', 'jpg', 'png', 'jpeg'];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        alert("Invalid file type. Allowed: PDF, DOCX, PPTX, JPG, PNG");
        e.target.value = '';
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Create Homework</h1>
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

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Attachment (Optional)</label>
            <Input type="file" onChange={handleFileChange} accept=".pdf,.docx,.pptx,.jpg,.png,.jpeg" />
            <p className="text-xs text-slate-400 mt-1">Supported: PDF, DOCX, PPTX, JPG, PNG</p>
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
            {submitting ? "Creating..." : "Save as Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
