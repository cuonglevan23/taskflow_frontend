"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import { LIGHT_THEME } from "@/constants/theme";

const Hero = () => {
  const features = [
    "Free 14-day trial",
    "No credit card required",
    "Cancel anytime"
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              New: Advanced team collaboration features
            </div>

            {/* Main heading */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: LIGHT_THEME.text.primary }}
            >
              A better way to{" "}
              <span className="text-blue-600 relative">
                manage tasks
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-blue-200"
                  viewBox="0 0 200 12"
                  fill="currentColor"
                >
                  <path d="M0,8 Q50,0 100,6 T200,4 L200,12 L0,12 Z" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl mb-8 max-w-2xl mx-auto lg:mx-0"
              style={{ color: LIGHT_THEME.text.secondary }}
            >
              Stay organized, focused, and in charge. TaskFlow helps teams manage projects
              efficiently so you can focus on what matters most.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link href="/auth/signup">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold"
                >
                  Get started free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Features list */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm" style={{ color: LIGHT_THEME.text.muted }}>
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main dashboard mockup */}
            <div
              className="relative rounded-2xl shadow-2xl border p-6"
              style={{
                backgroundColor: LIGHT_THEME.background.primary,
                borderColor: LIGHT_THEME.border.default
              }}
            >
              {/* Browser header */}
              <div
                className="flex items-center gap-2 mb-4 pb-3 border-b"
                style={{ borderColor: LIGHT_THEME.border.muted }}
              >
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div
                  className="flex-1 rounded px-3 py-1 text-xs ml-4"
                  style={{
                    backgroundColor: LIGHT_THEME.background.secondary,
                    color: LIGHT_THEME.text.muted
                  }}
                >
                  taskflow.com/dashboard
                </div>
              </div>

              {/* Dashboard content mockup */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div
                    className="h-8 rounded w-32"
                    style={{ backgroundColor: LIGHT_THEME.background.muted }}
                  ></div>
                  <div className="h-8 bg-blue-100 rounded w-24"></div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg p-3"
                      style={{ backgroundColor: LIGHT_THEME.background.secondary }}
                    >
                      <div
                        className="h-4 rounded w-16 mb-2"
                        style={{ backgroundColor: LIGHT_THEME.background.muted }}
                      ></div>
                      <div
                        className="h-6 rounded w-8"
                        style={{ backgroundColor: LIGHT_THEME.border.default }}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* Task list */}
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded"
                      style={{ backgroundColor: LIGHT_THEME.background.secondary }}
                    >
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                      <div
                        className="h-4 rounded flex-1"
                        style={{ backgroundColor: LIGHT_THEME.background.muted }}
                      ></div>
                      <div className="h-6 bg-blue-100 rounded w-16 text-xs"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg">
              <div className="text-xs font-medium">Tasks completed</div>
              <div className="text-2xl font-bold">24</div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg">
              <div className="text-xs font-medium">Team members</div>
              <div className="text-2xl font-bold">8</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
