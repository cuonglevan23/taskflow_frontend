"use client";

import React from "react";
import {
  CheckSquare,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,
  Zap,
  Shield,
  Globe,
  Clock
} from "lucide-react";
import { LIGHT_THEME } from "@/constants/theme";

const Features = () => {
  const features = [
    {
      id: 1,
      name: "Smart Task Management",
      description: "Create, organize, and track tasks with powerful automation and intelligent prioritization.",
      icon: CheckSquare,
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Team Collaboration",
      description: "Work together seamlessly with real-time updates, comments, and file sharing.",
      icon: Users,
      color: "bg-green-500",
    },
    {
      id: 3,
      name: "Advanced Analytics",
      description: "Get insights into team performance with detailed reports and progress tracking.",
      icon: BarChart3,
      color: "bg-purple-500",
    },
    {
      id: 4,
      name: "Calendar Integration",
      description: "Sync with your favorite calendar apps and never miss a deadline again.",
      icon: Calendar,
      color: "bg-orange-500",
    },
    {
      id: 5,
      name: "Real-time Communication",
      description: "Stay connected with built-in messaging, notifications, and activity feeds.",
      icon: MessageSquare,
      color: "bg-pink-500",
    },
    {
      id: 6,
      name: "Workflow Automation",
      description: "Automate repetitive tasks and focus on what matters most to your business.",
      icon: Zap,
      color: "bg-yellow-500",
    },
    {
      id: 7,
      name: "Enterprise Security",
      description: "Bank-level security with SSO, 2FA, and compliance with industry standards.",
      icon: Shield,
      color: "bg-red-500",
    },
    {
      id: 8,
      name: "Global Accessibility",
      description: "Access your work from anywhere with mobile apps and offline capabilities.",
      icon: Globe,
      color: "bg-indigo-500",
    },
    {
      id: 9,
      name: "Time Tracking",
      description: "Track time spent on tasks and projects for better productivity insights.",
      icon: Clock,
      color: "bg-teal-500",
    },
  ];

  return (
    <section
      id="features"
      className="py-20"
      style={{ backgroundColor: LIGHT_THEME.background.primary }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: LIGHT_THEME.text.primary }}
          >
            Everything you need to manage your projects
          </h2>
          <p
            className="text-xl max-w-3xl mx-auto"
            style={{ color: LIGHT_THEME.text.secondary }}
          >
            Powerful features designed to help teams of all sizes collaborate effectively
            and achieve their goals faster.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group relative border rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: LIGHT_THEME.background.primary,
                  borderColor: LIGHT_THEME.border.default
                }}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: LIGHT_THEME.text.primary }}
                >
                  {feature.name}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: LIGHT_THEME.text.secondary }}
                >
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{ backgroundColor: LIGHT_THEME.background.secondary }}
                ></div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Features;
