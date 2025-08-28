"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import { LIGHT_THEME } from "@/constants/theme";

const CTA = () => {
  const benefits = [
    "14-day free trial",
    "No credit card required",
    "Setup in under 5 minutes",
    "Cancel anytime"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Ready to transform your team's productivity?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of teams who have streamlined their workflow with TaskFlow.
              Start your free trial today and see the difference.
            </p>

            {/* Benefits list */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-4"
                >
                  Start free trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4"
              >
                Schedule demo
              </Button>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            {/* Dashboard preview */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-white/20 rounded w-32"></div>
                  <div className="h-6 bg-green-400 rounded w-20"></div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-blue-100 mb-1">
                      <span>Project Alpha</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full w-[85%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-blue-100 mb-1">
                      <span>Beta Release</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full w-[60%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-blue-100 mb-1">
                      <span>Marketing Campaign</span>
                      <span>40%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full w-[40%]"></div>
                    </div>
                  </div>
                </div>

                {/* Team avatars */}
                <div className="flex items-center gap-2 pt-4">
                  <span className="text-sm text-blue-100">Team:</span>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white"
                      ></div>
                    ))}
                  </div>
                  <span className="text-sm text-blue-100">+12 more</span>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg">
              <div className="text-xs font-medium">Tasks completed today</div>
              <div className="text-2xl font-bold">47</div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg">
              <div className="text-xs font-medium">Time saved</div>
              <div className="text-2xl font-bold">8.5h</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
