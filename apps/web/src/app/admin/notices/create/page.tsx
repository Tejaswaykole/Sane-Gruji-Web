"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

const noticeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  content: z.string().min(1, "Content is required"),
  publish_date: z.string().optional(),
  expiry_date: z.string().optional()
});

export default function CreateNoticePage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof noticeSchema>>({
    resolver: zodResolver(noticeSchema),
  });
  
  const [targetRoles, setTargetRoles] = useState<string[]>(['EVERYONE']);
  const [classes, setClasses] = useState<any[]>([]);
  const [targetClasses, setTargetClasses] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { accessToken } = useAuthStore();
  const router = useRouter();

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

  const toggleRole = (role: string) => {
    if (role === 'EVERYONE') {
      setTargetRoles(['EVERYONE']);
      return;
    }
    setTargetRoles(prev => {
      const filtered = prev.filter(r => r !== 'EVERYONE');
      if (filtered.includes(role)) return filtered.filter(r => r !== role);
      return [...filtered, role];
    });
  };

  const toggleClass = (classId: string) => {
    setTargetClasses(prev => {
      if (prev.includes(classId)) return prev.filter(c => c !== classId);
      return [...prev, classId];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedExtensions = ['pdf', 'docx', 'jpg', 'png', 'jpeg'];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        alert("Invalid file type. Allowed: PDF, DOCX, JPG, PNG");
        e.target.value = '';
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const onSubmit = async (data: z.infer<typeof noticeSchema>) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        target_roles: targetRoles,
        target_classes: targetClasses,
        status: "DRAFT" // default to draft, can be published from details page
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Failed to create notice");
      const notice = await res.json();

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices/${notice.id}/attachment`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData
        });
        if (!uploadRes.ok) {
          alert("Notice created but file upload failed.");
        }
      }

      alert("Notice created successfully!");
      router.push(`/admin/notices/${notice.id}`);
    } catch (e) {
      console.error(e);
      alert("Error creating notice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Create New Notice</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-slate-700">Title</label>
            <Input {...register("title")} placeholder="e.g. Annual Sports Day Announcement" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Category</label>
            <select {...register("category")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select Category...</option>
              <option value="GENERAL">General</option>
              <option value="ACADEMIC">Academic</option>
              <option value="EXAM">Exam</option>
              <option value="HOLIDAY">Holiday</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Attachment (Optional)</label>
            <Input type="file" onChange={handleFileChange} accept=".pdf,.docx,.jpg,.png,.jpeg" />
            <p className="text-xs text-slate-400 mt-1">Supported: PDF, DOCX, JPG, PNG</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Publish Date</label>
            <Input type="date" {...register("publish_date")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Expiry Date</label>
            <Input type="date" {...register("expiry_date")} />
          </div>

          <div className="col-span-2 border-t border-slate-100 pt-6">
            <label className="block text-sm font-medium mb-2 text-slate-700">Target Roles</label>
            <div className="flex flex-wrap gap-2">
              {['EVERYONE', 'TEACHER', 'STUDENT', 'PARENT', 'ADMISSION_OFFICER'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    targetRoles.includes(role) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {(targetRoles.includes('STUDENT') || targetRoles.includes('PARENT')) && (
            <div className="col-span-2 border-t border-slate-100 pt-6">
              <label className="block text-sm font-medium mb-2 text-slate-700">Target Classes (Leave empty for all classes)</label>
              <div className="flex flex-wrap gap-2">
                {classes.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClass(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      targetClasses.includes(c.id) 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.class_name} {c.section}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="col-span-2 border-t border-slate-100 pt-6">
            <label className="block text-sm font-medium mb-1 text-slate-700">Content / Description</label>
            <textarea 
              {...register("content")} 
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Enter full notice content here..."
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Save Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
