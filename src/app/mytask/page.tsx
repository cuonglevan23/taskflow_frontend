"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const MyTaskPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default tab (list) when accessing /mytask
    router.replace("/mytask/list");
  }, [router]);

  return null;
};

export default MyTaskPage;