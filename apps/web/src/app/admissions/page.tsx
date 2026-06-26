"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inquirySchema = z.object({
  student_name: z.string().min(1, "Student name is required"),
  parent_name: z.string().min(1, "Parent name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  grade_applying: z.string().min(1, "Grade is required"),
  message: z.string().optional()
});

export default function AdmissionsPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: z.infer<typeof inquirySchema>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Failed to submit inquiry");
      setSuccess(true);
      reset();
    } catch (e) {
      console.error(e);
      alert("Error submitting inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Inquiry Submitted!</h2>
          <p className="text-slate-600">Thank you for your interest in Sane Guruji School. Our admission team will contact you shortly.</p>
          <Button onClick={() => setSuccess(false)} className="mt-4 w-full">Submit Another Inquiry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admissions Inquiry</h1>
          <p className="mt-4 text-lg text-slate-600">
            Fill out the form below to learn more about our programs and enrollment process.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Student Name</label>
              <Input {...register("student_name")} placeholder="John Doe Jr." />
              {errors.student_name && <p className="text-red-500 text-xs mt-1">{errors.student_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Parent/Guardian Name</label>
              <Input {...register("parent_name")} placeholder="John Doe" />
              {errors.parent_name && <p className="text-red-500 text-xs mt-1">{errors.parent_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Phone Number</label>
              <Input {...register("phone")} placeholder="+1 (555) 000-0000" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Email Address</label>
              <Input type="email" {...register("email")} placeholder="john@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-slate-700">Grade Applying For</label>
              <select {...register("grade_applying")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select Grade...</option>
                <option value="Pre-K">Pre-K</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
              {errors.grade_applying && <p className="text-red-500 text-xs mt-1">{errors.grade_applying.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-slate-700">Message / Questions (Optional)</label>
              <textarea 
                {...register("message")} 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Any specific questions or information you'd like to share?"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Inquiry"}
          </Button>
        </form>
      </div>
    </div>
  );
}
