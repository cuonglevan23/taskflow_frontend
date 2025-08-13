"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyTaskPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default tab (list) when accessing /my-tasks
    router.replace("/my-tasks/list");
  }, [router]);

  return null;
};

