"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

const teacherSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  address: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.coerce.number().optional(),
  joining_date: z.string().min(1, "Joining date is required"),
});

export default function CreateTeacherPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof teacherSchema>>({
    resolver: zodResolver(teacherSchema),
  });
  const { accessToken } = useAuthStore();
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof teacherSchema>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Failed to add teacher");
        return;
      }
      alert("Teacher added successfully!");
      router.push("/admin/teachers");
    } catch (e) {
      console.error(e);
      alert("Error adding teacher");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Add New Teacher</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Personal Info */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Personal Information</h2>
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
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Contact Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Phone</label>
              <Input {...register("phone")} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-slate-700">Address</label>
              <Input {...register("address")} />
            </div>
          </div>
        </div>

        {/* Employment Info */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Employment Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Employee ID</label>
              <Input {...register("employee_id")} />
              {errors.employee_id && <p className="text-red-500 text-xs mt-1">{errors.employee_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Joining Date</label>
              <Input type="date" {...register("joining_date")} />
              {errors.joining_date && <p className="text-red-500 text-xs mt-1">{errors.joining_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Qualification</label>
              <Input {...register("qualification")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Experience (Years)</label>
              <Input type="number" {...register("experience")} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit">Add Teacher</Button>
        </div>
      </form>
    </div>
  );
}
