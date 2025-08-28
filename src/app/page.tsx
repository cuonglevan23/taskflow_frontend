import React from "react";
import PublicLayout from "@/layouts/public/PublicLayout";
import Hero from "@/layouts/public/components/Hero";
import Features from "@/layouts/public/components/Features";
import Testimonials from "@/layouts/public/components/Testimonials";
import Pricing from "@/layouts/public/components/Pricing";
import CTA from "@/layouts/public/components/CTA";

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
    </PublicLayout>
  );
}
