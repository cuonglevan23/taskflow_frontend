import React from "react";
import { PageLayout } from "@/layouts/page";

const MyTaskLayout = ({ children }: { children: React.ReactNode }) => {
  return <PageLayout>{children}</PageLayout>;
};

export default MyTaskLayout;
