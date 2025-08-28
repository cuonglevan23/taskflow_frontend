"use client";

import React from "react";
import PageLayout from "@/layouts/page/PageLayout";

export default function NewsFeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
