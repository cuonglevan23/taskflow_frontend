"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const GoalsPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default tab (strategy-map) when accessing /goals
    router.replace("/goals/strategy-map");
  }, [router]);

  return null;
};

export default GoalsPage;