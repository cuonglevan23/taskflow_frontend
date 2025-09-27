import React from "react";
import { PublicLayout } from "@/layouts";
import Hero from "@/layouts/public/components/Hero";
import Features from "@/layouts/public/components/Features";
import About from "@/layouts/public/components/About";
import Testimonials from "@/layouts/public/components/Testimonials";
import Pricing from "@/layouts/public/components/Pricing";
import Contact from "@/layouts/public/components/Contact";
import CTA from "@/layouts/public/components/CTA";

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <Features />
      <About />
      <Testimonials />
      <Pricing />
      <Contact />
      <CTA />
    </PublicLayout>
  );
}
