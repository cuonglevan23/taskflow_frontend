"use client";

import React from "react";
import { Star, Quote } from "lucide-react";
import { LIGHT_THEME } from "@/constants/theme";
import { INTEGRATION_COMPANIES } from "@/constants/logos";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "TechStart Inc.",
      image: "/images/avatar1.jpg",
      content: "TaskFlow has completely transformed how our team collaborates. We've increased our productivity by 40% since switching from our old project management tool.",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Engineering Lead",
      company: "DevCorp",
      image: "/images/avatar2.jpg",
      content: "The automation features in TaskFlow are incredible. What used to take hours of manual work now happens automatically. It's a game-changer for our development workflow.",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Operations Director",
      company: "Growth Solutions",
      image: "/images/avatar3.jpg",
      content: "Finally, a project management tool that the entire team actually enjoys using. The interface is intuitive and the collaboration features are top-notch.",
      rating: 5
    }
  ];

  const stats = [
    { value: "50k+", label: "Happy customers" },
    { value: "2M+", label: "Tasks completed" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9/5", label: "Customer rating" }
  ];

  return (
    <section
      className="py-20"
      style={{ backgroundColor: LIGHT_THEME.background.primary }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Stats section */}
        <div className="text-center mb-20">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: LIGHT_THEME.text.primary }}
          >
            Trusted by teams worldwide
          </h2>
          <p
            className="text-xl mb-12"
            style={{ color: LIGHT_THEME.text.secondary }}
          >
            Join thousands of teams who have transformed their workflow with TaskFlow
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div style={{ color: LIGHT_THEME.text.secondary }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3
            className="text-2xl font-bold text-center mb-12"
            style={{ color: LIGHT_THEME.text.primary }}
          >
            What our customers say
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-2xl p-6 relative"
                style={{ backgroundColor: LIGHT_THEME.background.secondary }}
              >
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-blue-600 mb-4" />

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <blockquote
                  className="mb-6 leading-relaxed"
                  style={{ color: LIGHT_THEME.text.secondary }}
                >
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div
                      className="font-semibold"
                      style={{ color: LIGHT_THEME.text.primary }}
                    >
                      {testimonial.name}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: LIGHT_THEME.text.muted }}
                    >
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Company Logos Section */}
        <div className="text-center mb-16">
          <h3
            className="text-xl font-semibold mb-8"
            style={{ color: LIGHT_THEME.text.primary }}
          >
            Connect with 300+ integrations
          </h3>
          <p
            className="text-lg mb-12 max-w-2xl mx-auto"
            style={{ color: LIGHT_THEME.text.secondary }}
          >
            TaskFlow connects with the enterprise tools your organization already uses, right out of the box.
          </p>

          {/* Infinite Sliding Logos */}
          <div className="relative overflow-hidden">
            {/* First row - sliding left to right */}
            <div className="flex animate-slide-left mb-8">
              {[...INTEGRATION_COMPANIES, ...INTEGRATION_COMPANIES].map((company, index) => (
                <div
                  key={`row1-${index}`}
                  className="flex-shrink-0 mx-8 h-16 w-32 flex items-center justify-center"
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="max-h-full max-w-full object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>

            {/* Second row - sliding right to left */}
            <div className="flex animate-slide-right">
              {[...INTEGRATION_COMPANIES.slice().reverse(), ...INTEGRATION_COMPANIES.slice().reverse()].map((company, index) => (
                <div
                  key={`row2-${index}`}
                  className="flex-shrink-0 mx-8 h-16 w-32 flex items-center justify-center"
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="max-h-full max-w-full object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>

            {/* Gradient overlays for smooth edges */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <button
              className="px-6 py-3 font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: LIGHT_THEME.button.primary.background,
                color: LIGHT_THEME.button.primary.text
              }}
            >
              See all integrations
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes slide-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-slide-left {
          animation: slide-left 40s linear infinite;
        }

        .animate-slide-right {
          animation: slide-right 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
