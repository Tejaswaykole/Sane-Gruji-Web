"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || "Failed to login");
      }
      
      setAuth(result.user, result.access_token);
      
      // Redirect based on role
      const roleMap: Record<string, string> = {
        SUPER_ADMIN: "/admin",
        PRINCIPAL: "/principal",
        ADMISSION_OFFICER: "/admission-officer",
        TEACHER: "/teacher",
        PARENT: "/parent",
        STUDENT: "/student",
      };
      
      router.push(roleMap[result.user.role] || "/");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-6">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full shadow-xl">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-4xl text-primary mb-2">school</span>
          <h1 className="text-2xl font-bold text-on-surface">ERP Login</h1>
          <p className="text-on-surface-variant text-sm mt-1">Welcome back to EduPortal</p>
        </div>
        
        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-sm rounded-md">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
            <Input type="email" placeholder="Enter your email" {...register("email")} />
            {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
            <Input type="password" placeholder="Enter your password" {...register("password")} />
            {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex justify-end">
            <Link href="#" className="text-xs text-primary hover:underline">Forgot Password?</Link>
          </div>
          <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
            &larr; Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}