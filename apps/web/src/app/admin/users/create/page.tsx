"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  roleId: z.string().min(1, "Role is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function CreateUserPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
  });
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [roles, setRoles] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/roles`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(console.error);
    }
  }, [accessToken]);

  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to create user");
        return;
      }
      alert("User created successfully!");
      router.push("/admin/users");
    } catch (e) {
      console.error(e);
      alert("Error creating user");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New User</h1>
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
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
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Phone</label>
              <Input {...register("phone")} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Role</label>
            <select 
              {...register("roleId")} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a role...</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Password</label>
              <Input type="password" {...register("password")} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Confirm Password</label>
              <Input type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
