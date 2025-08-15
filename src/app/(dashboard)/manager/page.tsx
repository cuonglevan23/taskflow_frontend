"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ManagerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default tab (projects) when accessing /manager
    // This will be handled by the layout's role-based logic
    router.replace("/manager/projects");
  }, [router]);

  return null;
}