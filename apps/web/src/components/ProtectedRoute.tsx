"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!accessToken || !user) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
    }
  }, [user, accessToken, router, pathname, allowedRoles, isHydrated]);

  if (!isHydrated || !accessToken || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="min-h-screen flex items-center justify-center">Unauthorized</div>;
  }

  return <>{children}</>;
}
