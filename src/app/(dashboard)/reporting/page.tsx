"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ReportingPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default tab (dashboards) when accessing /reporting
    router.replace("/reporting/dashboards");
  }, [router]);

  return null;
};

export default ReportingPage;