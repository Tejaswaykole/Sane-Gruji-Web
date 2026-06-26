"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { useState, useEffect } from "react";

const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
  blood_group: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  admission_no: z.string().min(1, "Admission number is required"),
  admission_date: z.string().min(1, "Admission date is required"),
  class_id: z.string().min(1, "Class is required"),
  parent: z.object({
    father_name: z.string().optional(),
    mother_name: z.string().optional(),
    guardian_name: z.string().optional(),
    phone: z.string().min(1, "Parent phone is required"),
  }).refine(data => data.father_name || data.mother_name || data.guardian_name, {
    message: "At least one parent/guardian name is required",
    path: ["father_name"]
  })
});

export default function CreateStudentPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
  });
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [classes, setClasses] = useState<{id: string, class_name: string, section: string}[]>([]);

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

  const onSubmit = async (data: z.infer<typeof studentSchema>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Failed to enroll student");
        return;
      }
      alert("Student enrolled successfully!");
      router.push("/admin/students");
    } catch (e) {
      console.error(e);
      alert("Error enrolling student");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Enroll New Student</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Personal Info */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">A. Personal Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">First Name</label>
              <Input {...register("first_name")} />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Last Name</label>
              <Input {...register("last_name")} />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Date of Birth</label>
              <Input type="date" {...register("dob")} />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Gender</label>
              <select {...register("gender")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Blood Group</label>
              <select {...register("blood_group")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">B. Contact Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Student Phone</label>
              <Input {...register("phone")} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Student Email</label>
              <Input type="email" {...register("email")} placeholder="Optional" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-slate-700">Address</label>
              <Input {...register("address")} />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">C. Academic Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Admission Number</label>
              <Input {...register("admission_no")} />
              {errors.admission_no && <p className="text-red-500 text-xs mt-1">{errors.admission_no.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Admission Date</label>
              <Input type="date" {...register("admission_date")} />
              {errors.admission_date && <p className="text-red-500 text-xs mt-1">{errors.admission_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Class</label>
              <select {...register("class_id")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select a class...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
                ))}
              </select>
              {errors.class_id && <p className="text-red-500 text-xs mt-1">{errors.class_id.message}</p>}
            </div>
          </div>
        </div>

        {/* Parent Info */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">D. Parent Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Father's Name</label>
              <Input {...register("parent.father_name")} />
              {errors.parent?.father_name && <p className="text-red-500 text-xs mt-1">{errors.parent.father_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Mother's Name</label>
              <Input {...register("parent.mother_name")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Guardian's Name</label>
              <Input {...register("parent.guardian_name")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Primary Phone</label>
              <Input {...register("parent.phone")} />
              {errors.parent?.phone && <p className="text-red-500 text-xs mt-1">{errors.parent.phone.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit">Enroll Student</Button>
        </div>
      </form>
    </div>
  );
}
