"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default function TeamPage({ params }: TeamPageProps) {
  const router = useRouter();

  useEffect(() => {
    const redirectToOverview = async () => {
      const resolvedParams = await params;
      router.replace(`/teams/${resolvedParams.id}/overview`);
    };

    redirectToOverview();
  }, [params, router]);

  return null;
}