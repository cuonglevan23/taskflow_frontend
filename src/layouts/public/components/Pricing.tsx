"use client";

import React, { useState } from "react";
import { Check, Star } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import { LIGHT_THEME } from "@/constants/theme";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Up to 5 team members",
        "Unlimited tasks",
        "Basic project templates",
        "Mobile app access",
        "Email support",
        "2GB file storage"
      ],
      cta: "Get started free",
      popular: false
    },
    {
      name: "Professional",
      description: "Best for growing teams and businesses",
      monthlyPrice: 12,
      annualPrice: 10,
      features: [
        "Up to 25 team members",
        "Advanced analytics",
        "Custom workflows",
        "Time tracking",
        "Priority support",
        "50GB file storage",
        "Calendar integration",
        "Custom fields"
      ],
      cta: "Start free trial",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large organizations with advanced needs",
      monthlyPrice: 25,
      annualPrice: 20,
      features: [
        "Unlimited team members",
        "Advanced security & compliance",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
        "Unlimited file storage",
        "Advanced reporting",
        "SSO & SAML",
        "API access"
      ],
      cta: "Contact sales",
      popular: false
    }
  ];

  return (
    <section
      id="pricing"
      className="py-20"
      style={{ backgroundColor: LIGHT_THEME.background.secondary }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: LIGHT_THEME.text.primary }}
          >
            Simple, transparent pricing
          </h2>
          <p
            className="text-xl max-w-3xl mx-auto mb-8"
            style={{ color: LIGHT_THEME.text.secondary }}
          >
            Choose the plan that works best for your team. All plans include a 14-day free trial.
          </p>

          {/* Billing toggle */}
          <div
            className="inline-flex items-center rounded-lg p-1 border"
            style={{
              backgroundColor: LIGHT_THEME.background.primary,
              borderColor: LIGHT_THEME.border.default
            }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAnnual
                  ? "bg-blue-600 text-white"
                  : "hover:text-gray-900"
              }`}
              style={!isAnnual ? {} : { color: LIGHT_THEME.text.secondary }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAnnual
                  ? "bg-blue-600 text-white"
                  : "hover:text-gray-900"
              }`}
              style={isAnnual ? {} : { color: LIGHT_THEME.text.secondary }}
            >
              Annual
              <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={`relative shadow-sm border-2 p-8 rounded-2xl ${
                  plan.popular
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : ""
                }`}
                style={{
                  backgroundColor: LIGHT_THEME.background.primary,
                  borderColor: plan.popular ? "#3b82f6" : LIGHT_THEME.border.default
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Most popular
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: LIGHT_THEME.text.primary }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="mb-6"
                    style={{ color: LIGHT_THEME.text.secondary }}
                  >
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <span
                      className="text-5xl font-bold"
                      style={{ color: LIGHT_THEME.text.primary }}
                    >
                      ${price}
                    </span>
                    <span
                      className="ml-1"
                      style={{ color: LIGHT_THEME.text.secondary }}
                    >
                      /{isAnnual ? "month" : "month"}
                    </span>
                  </div>

                  {isAnnual && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-green-600">
                      Save ${(plan.monthlyPrice - plan.annualPrice) * 12} per year
                    </p>
                  )}
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span style={{ color: LIGHT_THEME.text.secondary }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA section - Replace button with attractive info card */}
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6">
                    <div className="mb-4">
                      <svg className="w-12 h-12 mx-auto text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>

                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Ready for Enterprise?
                      </h4>

                      <p className="text-sm text-gray-600 mb-4">
                        Get custom pricing and dedicated support for your organization
                      </p>
                    </div>

                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Custom Setup
                      </div>
                      <div className="flex items-center text-blue-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        24/7 Support
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      💎 Premium features • 🚀 Priority setup • 📞 Dedicated support
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Solution Section */}
        <div className="text-center">
          <div
            className="max-w-3xl mx-auto p-8 rounded-2xl shadow-lg border"
            style={{
              backgroundColor: LIGHT_THEME.background.primary,
              borderColor: LIGHT_THEME.border.default
            }}
          >
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>

              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: LIGHT_THEME.text.primary }}
              >
                Need a custom solution?
              </h3>

              <p
                className="text-lg mb-6"
                style={{ color: LIGHT_THEME.text.secondary }}
              >
                We offer custom plans for large enterprises with specific requirements.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span style={{ color: LIGHT_THEME.text.secondary }}>Custom integrations & workflows</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span style={{ color: LIGHT_THEME.text.secondary }}>Enhanced security & compliance</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span style={{ color: LIGHT_THEME.text.secondary }}>Dedicated account management</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span style={{ color: LIGHT_THEME.text.secondary }}>Priority support & training</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ color: '#ffffff' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact our sales team
            </Button>
          </div>
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p
            className="text-sm"
            style={{ color: LIGHT_THEME.text.secondary }}
          >
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
