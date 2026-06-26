"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

const editUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  roleId: z.string().min(1, "Role is required"),
});

export default function EditUserPage() {
  const { id } = useParams();
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [roles, setRoles] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
  });

  useEffect(() => {
    if (accessToken && id) {
      // Fetch Roles
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/roles`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(console.error);

      // Fetch User Details
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => {
        reset({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || "",
          roleId: data.roleId || "",
        });
        setLoading(false);
      })
      .catch(console.error);
    }
  }, [accessToken, id, reset]);

  const onSubmit = async (data: z.infer<typeof editUserSchema>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to update user");
        return;
      }
      alert("User updated successfully!");
      router.push(`/admin/users/${id}`);
    } catch (e) {
      console.error(e);
      alert("Error updating user");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading user details...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Edit User</h1>
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

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
